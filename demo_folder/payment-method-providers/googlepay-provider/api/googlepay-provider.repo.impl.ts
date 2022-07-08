import {
	IGooglePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.repo";
import { CreditCardProvider, } from "@wallet-app/configurator/configurator.types";
import {
	IGooglePayRequestBody,
	IPaymentMethodData,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.types";
import { ApiClient, } from "@wallet-app/infrastructure/api/api-client";
import { IPCIError, IWalletMSError, MerchantsList, } from "@wallet-app/payments/payments.types";
import { env, } from "@wallet-app/infrastructure/constants";
import { Environments, } from "@wallet-app/infrastructure/types";
import { PaymentsErrorManager, } from "@wallet-app/payments/payments-error-handler";

const GOOGLE_PAY_ADD_CARD_URL = "/api/v1/add-pm";

export class GooglePayProviderRepoImpl implements IGooglePayProviderRepo {
	public addCard = async (
		paymentData: IPaymentMethodData,
		paymentProvider: CreditCardProvider,
		accessToken: string
	): Promise<void> => {
		try {
			const postData: IGooglePayRequestBody = {
				source: MerchantsList.GOOGLE_PAY,
				env: env === Environments.Production ? Environments.Production : Environments.Test,
				accessToken,
				ccType: paymentData.info.cardNetwork,
				token: btoa(paymentData.tokenizationData.token),
			};

			await ApiClient.instancePCI.post<IGooglePayRequestBody>(GOOGLE_PAY_ADD_CARD_URL, postData);
		} catch (err: any) {
			if (err.errorId) {
				PaymentsErrorManager.setWalletMicroserviceError(err as IWalletMSError);
			} else {
				PaymentsErrorManager.setPaymentMethodsError(err as IPCIError);
			}
			throw err;
		}
	};
}
