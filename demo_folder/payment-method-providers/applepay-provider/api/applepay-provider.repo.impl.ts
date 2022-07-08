import {
	IApplePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.repo";
import {
	IApplePayAddCardExtraParams, IApplePayAddCardRequest, IApplePaySessionResponse, IApplePaySessionResponseData,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.types";
import { PaymentsErrorManager, } from "@wallet-app/payments/payments-error-handler";
import { IPCIError, IWalletMSError, MerchantsList, } from "@wallet-app/payments/payments.types";
import { ApiClient, } from "@wallet-app/infrastructure/api/api-client";
import { ADD_PAYMENT_METHOD_URL, } from "@wallet-app/payments/payment-methods/payment-methods";
import { AppErrorHandler, } from "@wallet-app/infrastructure/error-handler/global-error-handler";
import { AxiosResponse } from "axios";

const composeApplePaySessionURL = (url: string) => `/wallet/api/v1/add-pm?validation_url=${url}`;

export class ApplePayProviderRepoImpl implements IApplePayProviderRepo {
	public addCard = async (accessToken: string, externalToken: string, extraParams: IApplePayAddCardExtraParams): Promise<void> => {
		try {
			const postData: IApplePayAddCardRequest = {
				accessToken,
				externalToken,
				extraParams,
				source: MerchantsList.APPLEPAY,
			};

			await ApiClient.instance.post<IApplePayAddCardRequest>(ADD_PAYMENT_METHOD_URL, postData);
		} catch (err: any) {
			if (err.errorId) {
				PaymentsErrorManager.setWalletMicroserviceError(err as IWalletMSError);
			} else {
				PaymentsErrorManager.setPaymentMethodsError(err as IPCIError);
			}
		}
	};

	public getSession = async (url: string): Promise<IApplePaySessionResponseData> => {
		try {
			const response: AxiosResponse<IApplePaySessionResponse> = await ApiClient.instance.get<IApplePaySessionResponse>(composeApplePaySessionURL(url));
			return response.data.response;
		} catch (err) {
			AppErrorHandler.setError(err as Error);
			throw err;
		}
	};
}
