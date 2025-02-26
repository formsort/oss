enum AnalyticsEventType {
  FlowLoaded = 'FlowLoaded',
  FlowClosed = 'FlowClosed',
  UrlOpened = 'UrlOpened',
  StepLoaded = 'StepLoaded',
  StepCompleted = 'StepCompleted',
  EmailCollected = 'EmailCollected',
  FlowFinalized = 'FlowFinalized',
  PhoneCollected = 'PhoneCollected',
  ResponderStateUpdated = 'ResponderStateUpdated',
  SyntheticResponderActivity = 'SyntheticResponderActivity',
  StripeStartedCheckout = 'StripeStartedCheckout',
  StripeSelectedProduct = 'StripeSelectedProduct',
  StripeSelectedPlan = 'StripeSelectedPlan',
  StripeAddedPaymentMethod = 'StripeAddedPaymentMethod',
  StripeCompletedCheckout = 'StripeCompletedCheckout',
}

export default AnalyticsEventType;
