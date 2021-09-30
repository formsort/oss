export type JSONPrimitive = string | boolean | number;

export interface IAddressObject {
  raw?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

export type IFlowAnswer =
  | undefined
  | JSONPrimitive
  | JSONPrimitive[]
  | Partial<IAddressObject>;

export interface IFlowAnswers {
  [answerKey: string]: IFlowAnswer;
}
