const AnalyticsEventType = {
  FlowLoaded: 'FlowLoaded',
  FlowClosed: 'FlowClosed',
  UrlOpened: 'UrlOpened',
  StepLoaded: 'StepLoaded',
  StepCompleted: 'StepCompleted',
  EmailCollected: 'EmailCollected',
  FlowFinalized: 'FlowFinalized',
}

Object.seal(AnalyticsEventType);

export default AnalyticsEventType;
