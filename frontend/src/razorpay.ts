type CheckoutResult = { razorpay_payment_id: string; razorpay_signature: string }
type CheckoutOptions = {
  key: string
  order_id: string
  amount: number
  currency: 'INR'
  name: string
  description: string
  handler: (result: CheckoutResult) => void
  modal: { ondismiss: () => void }
}
type Checkout = new (options: CheckoutOptions) => { open: () => void }
let load: Promise<Checkout> | undefined

export function razorpayCheckout() {
  const host = window as Window & { Razorpay?: Checkout }
  if (host.Razorpay) return Promise.resolve(host.Razorpay)
  load ??= new Promise<Checkout>((resolve, reject) => {
    const script = document.createElement('script')
    const fail = () => {
      script.remove()
      reject(new Error('Razorpay Checkout could not load. Try again.'))
    }
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => host.Razorpay ? resolve(host.Razorpay) : fail()
    script.onerror = fail
    document.head.append(script)
  }).catch((error: unknown) => {
    load = undefined
    throw error
  })
  return load
}
