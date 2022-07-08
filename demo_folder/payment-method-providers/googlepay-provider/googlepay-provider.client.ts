import {
	IPaymentMethodsConnector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/payment-methods.connector";
import {
	googlePayProviderInjector,
	setupGooglePayProviderInjector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.injector";
import {
	GOOGLE_PAY_PROVIDER_SERVICE,
	IGooglePayProviderService,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.service";

export class GooglePayProviderClient implements IPaymentMethodsConnector {
	private _service!: IGooglePayProviderService;

	public init = (): void => {
		setupGooglePayProviderInjector();
		this._service = googlePayProviderInjector.get<IGooglePayProviderService>(GOOGLE_PAY_PROVIDER_SERVICE);
		this._service.init();
	};
}
