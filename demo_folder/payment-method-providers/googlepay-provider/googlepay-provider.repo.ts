import { CreditCardProvider, } from "@wallet-app/configurator/configurator.types";
import {
	IPaymentMethodData,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.types";

export const GOOGLE_PAY_PROVIDER_REPO = "GOOGLE_PAY_PROVIDER_REPO";

export interface IGooglePayProviderRepo {
	addCard: (
		paymentData: IPaymentMethodData,
		paymentProvider: CreditCardProvider,
		accessToken: string,
	) => Promise<void>;
}
