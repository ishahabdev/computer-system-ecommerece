import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { BsTruck, BsCheckCircleFill } from "react-icons/bs"
import { IoCheckmarkCircle } from "react-icons/io5"
import { FiXCircle } from "react-icons/fi"
import { useAuth } from "../../context/AuthContext"
import { getLiveOrderStatus, readCustomerList, writeCustomerList } from "../Dashbaord/dashboardStorage"

const API_BASE_URL = "http://localhost:9000/v1"

const TrackOrderSchema = Yup.object().shape({
  trackingId: Yup.string()
    .trim()
    .required("Tracking ID is required"),
})

const getOrderId = (order) => order.orderId || (order.id ? `ORD-${order.id}` : "")
const getOrderItems = (order) => {
  if (Array.isArray(order.items)) return order.items
  if (Array.isArray(order.products)) return order.products
  return []
}
const getItemName = (item) => item.title || item.name || "Product"
const getItemQty = (item) => item.qty || item.quantity || 1
const getOrderTotal = (order) => order.total ?? order.totalAmount ?? 0

const normalizeOrder = (order) => {
  if (!order) return null

  return {
    ...order,
    orderId: getOrderId(order),
    items: getOrderItems(order).map((item) => ({
      ...item,
      title: getItemName(item),
      qty: getItemQty(item),
      currency: item.currency || "$",
    })),
    total: getOrderTotal(order),
    shippingAddress: order.shippingAddress || order.address || "",
  }
}

const TrackOrder = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [orderData, setOrderData] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelError, setCancelError] = useState("")

  const findAndSetOrder = async (trackingId, isBackgroundSync = false) => {
    if (!trackingId) return

    if (!isBackgroundSync) {
      setErrorMessage("")
      setIsLoading(true)
    }

    const cleanId = String(trackingId).trim()

    try {
      // 1. First attempt to fetch real live order from backend
      const response = await fetch(`${API_BASE_URL}/track-order/${encodeURIComponent(cleanId)}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const normalizedOrder = normalizeOrder(result.data)
          setOrderData(normalizedOrder)

          if (user && normalizedOrder) {
            const orders = readCustomerList(user, "orders")
            const nextOrders = orders.map((order) => {
              const matchesOrder =
                String(order.orderId).toUpperCase() === normalizedOrder.orderId.toUpperCase() ||
                String(order.databaseOrderId || order.id) === String(normalizedOrder.id)

              return matchesOrder ? { ...order, status: normalizedOrder.status } : order
            })
            writeCustomerList(user, "orders", nextOrders)
          }

          setIsLoading(false)
          return
        }
      }
    } catch (err) {
      console.warn("Backend track order request failed, checking local storage:", err)
    }

    // 2. Fallback to localStorage if backend is unreachable or order is only local
    const orders = user ? readCustomerList(user, "orders") : []

    const localOrder = orders.find(
      (o) =>
        String(o.orderId).toUpperCase() === cleanId.toUpperCase() ||
        String(o.databaseOrderId) === cleanId.replace(/^ORD-/i, "") ||
        String(o.id) === cleanId.replace(/^ORD-/i, "")
    )

    if (localOrder) {
      const status = getLiveOrderStatus(localOrder)
      const normalizedOrder = normalizeOrder({ ...localOrder, status })
      setOrderData(normalizedOrder)

      if (user) {
        const nextOrders = orders.map((order) =>
          order === localOrder ? { ...order, status } : order
        )
        writeCustomerList(user, "orders", nextOrders)
      }
    } else if (!isBackgroundSync) {
      setErrorMessage("Invalid tracking ID. Please enter your valid tracking ID")
    }

    setIsLoading(false)
  }

  // Handle tracking ID from navigation state
  useEffect(() => {
    if (location.state?.orderId) {
      findAndSetOrder(location.state.orderId)
    }
  }, [location.state, user])

  // Periodic polling every 10 seconds to keep live tracking progress updated
  useEffect(() => {
    if (!orderData?.orderId && !orderData?.id) return

    const activeId = orderData.orderId || orderData.id
    const interval = setInterval(() => {
      findAndSetOrder(activeId, true)
    }, 10000)

    return () => clearInterval(interval)
  }, [orderData?.orderId, orderData?.id])

  const handleSubmit = (values, { setSubmitting }) => {
    findAndSetOrder(values.trackingId)
    setSubmitting(false)
  }

  // Cancel the currently displayed order (allowed until it is delivered).
  const handleCancelOrder = async () => {
    const dbId = orderData?.databaseOrderId ?? orderData?.id
    const token = localStorage.getItem("authToken")

    if (!dbId || !token) {
      setCancelError("You must be signed in to cancel this order.")
      return
    }

    setIsCancelling(true)
    setCancelError("")

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${dbId}/cancel`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to cancel order")
      }

      const cancelledOrder = normalizeOrder({ ...orderData, status: "cancelled" })
      setOrderData(cancelledOrder)

      if (user) {
        const orders = readCustomerList(user, "orders")
        const nextOrders = orders.map((order) => {
          const matches =
            String(order.orderId).toUpperCase() === String(cancelledOrder.orderId).toUpperCase() ||
            String(order.databaseOrderId || order.id) === String(dbId)
          return matches ? { ...order, status: "cancelled" } : order
        })
        writeCustomerList(user, "orders", nextOrders)
      }

      setShowCancelConfirm(false)
    } catch (err) {
      setCancelError(err.message || "Unable to cancel order")
    } finally {
      setIsCancelling(false)
    }
  }

  // Calculate order status and timeline using the shared status function
  const getOrderStatus = (order) => {
    if (!order) return null

    const orderDate = new Date(order.createdAt || order.orderDate)

    // Use the same shared function as the Dashboard
    const liveStatus = getLiveOrderStatus(order)
    
    // Map the live status string to a step number
    let currentStep = 1;
    if (liveStatus === "delivered") currentStep = 4;
    else if (liveStatus === "on delivery") currentStep = 3;
    else if (liveStatus === "shipping") currentStep = 2;
    else currentStep = 1;

    const statuses = {
      packing: currentStep >= 1,
      shipping: currentStep >= 2,
      onDelivery: currentStep >= 3,
      delivered: currentStep >= 4
    }

    return {
      ...statuses,
      currentStep,
      packingDate: orderDate.toLocaleString(),
      shippingDate: new Date(orderDate.getTime() + 10 * 60 * 1000).toLocaleString(),
      onDeliveryDate: new Date(orderDate.getTime() + 20 * 60 * 1000).toLocaleString(),
      deliveryDate: new Date(orderDate.getTime() + 30 * 60 * 1000).toLocaleString()
    }
  }

  const status = orderData ? getOrderStatus(orderData) : null
  const liveStatus = orderData ? getLiveOrderStatus(orderData) : null
  const canCancel =
    Boolean(user) && liveStatus && liveStatus !== "delivered" && liveStatus !== "cancelled"

  const inputClass = "w-full bg-gray-50 text-sm text-gray-600 placeholder-gray-400 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-[#2196F3]/40 transition"
  const labelClass = "block text-sm font-medium text-gray-700 mb-2"
  const errorClass = "text-xs text-red-600 mt-1"

  return (
    <main className="bg-white min-h-screen">
      {/* Breadcrumb bar */}
      <div className="bg-gray-50">
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-3">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-[#2196F3] hover:underline transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">tracking order</span>
          </nav>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-36 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#22262A] uppercase tracking-wide mb-2">
              Tracking Order
            </h1>
            <p className="text-sm text-gray-600">
              Please enter your order Tracking ID
            </p>
          </div>

          {/* Tracking Form */}
          {!orderData && (
            <Formik
              initialValues={{ trackingId: "" }}
              validationSchema={TrackOrderSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5 mb-8">
                  <div>
                    <label htmlFor="trackingId" className={labelClass}>
                      Order Tracking
                    </label>
                    <Field
                      id="trackingId"
                      name="trackingId"
                      type="text"
                      placeholder="D375673"
                      className={`${inputClass} ${
                        (errors.trackingId && touched.trackingId) || errorMessage
                          ? "ring-2 ring-red-500/40"
                          : ""
                      }`}
                    />
                    <ErrorMessage name="trackingId" component="div" className={errorClass} />
                    {errorMessage && (
                      <div className="text-xs text-red-600 mt-1">{errorMessage}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-[#2196F3] hover:bg-[#1a7fd1] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-3.5 rounded-md transition-colors"
                  >
                    {isLoading || isSubmitting ? "Searching..." : "Continue"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {/* Order Details */}
          {orderData && status && (
            <div className="space-y-8">
              {liveStatus === "cancelled" && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                  <FiXCircle className="text-xl shrink-0" />
                  <p className="text-sm font-semibold">This order has been cancelled.</p>
                </div>
              )}
              {/* Order Info */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-lg font-bold text-[#22262A] mb-4">My Order</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-semibold text-[#22262A]">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tracking ID:</span>
                    <span className="font-semibold text-[#22262A]">{orderData.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-semibold text-[#22262A]">
                      {new Date(orderData.orderDate || orderData.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Status:</span>
                    <span className="font-semibold text-[#2196F3] uppercase">{getLiveOrderStatus(orderData)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-[#22262A]">
                      ${getOrderTotal(orderData)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative">
                <h2 className="text-lg font-bold text-[#22262A] mb-6">Order Status</h2>

                {/* Progress Line */}
                <div className="relative flex items-center justify-between mb-8">
                  {/* Background line */}
                  <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200"></div>

                  {/* Progress line */}
                  <div
                    className="absolute top-6 left-0 h-1 bg-[#2196F3] transition-all duration-500"
                    style={{
                      width: `${((status.currentStep - 1) / 3) * 100}%`
                    }}
                  ></div>

                  {/* Step 1: Packing */}
                  <div className="relative flex flex-col items-center flex-1 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      status.packing ? 'bg-[#2196F3]' : 'bg-gray-200'
                    }`}>
                      {status.packing ? (
                        <IoCheckmarkCircle className="text-white text-2xl" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      status.packing ? 'text-[#2196F3]' : 'text-gray-400'
                    }`}>
                      Packing
                    </span>
                    {status.packing && (
                      <span className="text-xs text-gray-500 mt-1">{status.packingDate}</span>
                    )}
                  </div>

                  {/* Step 2: Shipping */}
                  <div className="relative flex flex-col items-center flex-1 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      status.shipping ? 'bg-[#2196F3]' : 'bg-gray-200'
                    }`}>
                      {status.shipping ? (
                        <IoCheckmarkCircle className="text-white text-2xl" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      status.shipping ? 'text-[#2196F3]' : 'text-gray-400'
                    }`}>
                      Shipping
                    </span>
                    {status.shipping && (
                      <span className="text-xs text-gray-500 mt-1">{status.shippingDate}</span>
                    )}
                  </div>

                  {/* Step 3: On Delivery */}
                  <div className="relative flex flex-col items-center flex-1 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      status.onDelivery ? 'bg-[#2196F3]' : 'bg-gray-200'
                    }`}>
                      {status.onDelivery ? (
                        <IoCheckmarkCircle className="text-white text-2xl" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      status.onDelivery ? 'text-[#2196F3]' : 'text-gray-400'
                    }`}>
                      On Delivery
                    </span>
                    {status.onDelivery && (
                      <span className="text-xs text-gray-500 mt-1">{status.onDeliveryDate}</span>
                    )}
                  </div>

                  {/* Step 4: Delivery */}
                  <div className="relative flex flex-col items-center flex-1 z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      status.delivered ? 'bg-[#2196F3]' : 'bg-gray-200'
                    }`}>
                      {status.delivered ? (
                        <IoCheckmarkCircle className="text-white text-2xl" />
                      ) : (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs font-semibold ${
                      status.delivered ? 'text-[#2196F3]' : 'text-gray-400'
                    }`}>
                      Delivery
                    </span>
                    {status.delivered ? (
                      <span className="text-xs text-gray-500 mt-1">{status.deliveryDate}</span>
                    ) : (
                      <span className="text-xs text-gray-500 mt-1">
                        Est: {status.deliveryDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {orderData.items && orderData.items.length > 0 && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-bold text-[#22262A] mb-4">Order Items</h2>
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                        <div className="flex items-center gap-3">
                          {item.imagePath ? (
                            <img
                              src={item.imagePath}
                              alt={getItemName(item)}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                              {item.image}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-[#22262A]">{getItemName(item)}</p>
                            <p className="text-xs text-gray-500">Qty: {getItemQty(item)}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#22262A]">
                          {item.currency || "$"}{item.price * getItemQty(item)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {(orderData.shippingAddress || orderData.address) && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-lg font-bold text-[#22262A] mb-4">Shipping Address</h2>
                  <div className="text-sm text-gray-700">
                    <p>{orderData.shippingAddress || orderData.address}</p>
                    {(orderData.city || orderData.state || orderData.zipCode) && (
                      <p>{orderData.city}, {orderData.state} {orderData.zipCode}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                {canCancel && (
                  <button
                    onClick={() => {
                      setCancelError("")
                      setShowCancelConfirm(true)
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold py-3.5 rounded-md border border-red-200 transition-colors"
                  >
                    <FiXCircle className="text-base" />
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => {
                    setOrderData(null)
                    setErrorMessage("")
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-[#22262A] text-sm font-semibold py-3.5 rounded-md transition-colors"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="track-cancel-title"
        >
          <div
            className="absolute inset-0 bg-black/40 transition-opacity"
            onClick={() => !isCancelling && setShowCancelConfirm(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiXCircle className="text-2xl" />
            </div>
            <h2 id="track-cancel-title" className="text-lg font-bold text-[#22262A]">
              Cancel this order?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Order #{orderData?.orderId} will be cancelled. This cannot be undone.
            </p>
            {cancelError && <p className="mt-3 text-sm text-red-600">{cancelError}</p>}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isCancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TrackOrder
