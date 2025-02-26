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
  StripeCompletedMobileCheckout = 'StripeCompletedMobileCheckout',
  StripeAddedPaymentMethod = 'StripeAddedPaymentMethod',
  StripePaymentCompleted = 'StripePaymentCompleted',
}

export default AnalyticsEventType;
