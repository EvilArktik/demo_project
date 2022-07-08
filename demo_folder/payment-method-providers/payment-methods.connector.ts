import { ICardInputData, } from "@wallet-app/payments/payment-methods/payment-methods";

type AsyncAddNewCard = (cardInputData?: ICardInputData) => Promise<void>;
type SyncAddNewCard = (cardInputData?: ICardInputData) => void;

export interface IPaymentMethodsConnector {
	init: () => void,
	addNewCard?: AsyncAddNewCard | SyncAddNewCard,
}

