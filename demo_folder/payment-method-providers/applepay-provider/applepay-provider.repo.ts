import {
	IApplePayAddCardExtraParams, IApplePaySessionResponseData,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.types";

export const APPLEPAY_PROVIDER_REPO = "APPLEPAY_PROVIDER_REPO";

export interface IApplePayProviderRepo {
	addCard: (
		accessToken: string,
		externalToken: string,
		extraParams: IApplePayAddCardExtraParams,
	) => Promise<void>;
	getSession: (url: string) => Promise<IApplePaySessionResponseData>;
}
