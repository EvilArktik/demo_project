import {
	IPaymentMethodsConnector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/payment-methods.connector";
import {
	APPLEPAY_PROVIDER_SERVICE,
	IApplePayProviderService,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.service";
import {
	applePayProviderInjector,
	setupApplePayProviderInjector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.injector";

export class ApplePayProviderClient implements IPaymentMethodsConnector {
	private _service!: IApplePayProviderService;

	public init = (): void => {
		setupApplePayProviderInjector();
		this._service = applePayProviderInjector.get<IApplePayProviderService>(APPLEPAY_PROVIDER_SERVICE);
		this._service.init();
	};

}
