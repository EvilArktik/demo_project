import { makeAutoObservable, } from "mobx";
import {
	GOOGLE_PAY_PROVIDER_REPO,
	IGooglePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.repo";
import { CONFIGURATION_SERVICE, IConfiguratorService, } from "@wallet-app/configurator/configurator.service";
import { IUserService, USER_SERVICE, } from "@wallet-app/user/user.service";
import { globalInjector, } from "@wallet-app/infrastructure/dependency-injector/injector";
import {
	googlePayProviderInjector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.injector";
import {
	GooglePayEnv,
	IGooglePaymentAllowedPaymentMethod,
	IGooglePaymentDataRequest,
	IGooglePaymentIsReadyToPay,
	IGooglePaymentIsReadyToPayAllowedPM,
	IPaymentMethodData,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.types";
import {
	IGooglePaySettings,
	IMerchantConfig,
	MerchantsList,
} from "@wallet-app/payments/payments.types";
import { env, } from "@wallet-app/infrastructure/constants";
import { CreditCardProvider, } from "@wallet-app/configurator/configurator.types";

export const GOOGLE_PAY_PROVIDER_SERVICE = "GOOGLE_PAY_PROVIDER_SERVICE";
export const GOOGLE_PAY_BUTTON_ID = "GooglePayCheckout";
const GOOGLE_PAY_LIB_URL = "https://pay.google.com/gp/p/js/pay.js";

export interface IGooglePayProviderService {
	init: () => void;
}

export class GooglePayProviderService implements IGooglePayProviderService {
	private _gPayClient: any;
	private _repo!: IGooglePayProviderRepo;
	private _configService!: IConfiguratorService;
	private _userService!: IUserService;
	private _googlePayIsReadyData: IGooglePaymentIsReadyToPay | null = null;
	private _googlePayDataRequest: IGooglePaymentDataRequest | null = null;

	constructor() {
		makeAutoObservable<IGooglePayProviderService>(this);
	}

	private _composeAllowedPaymentMethod = (): IGooglePaymentIsReadyToPayAllowedPM => ({
		type: "CARD",
		parameters: {
			allowedAuthMethods: ["PAN_ONLY"],
			allowedCardNetworks: this._configService.composeSupportedCreditCardTypesList()
				.filter(card => card.toLowerCase() !== "diners" || card.toLocaleLowerCase() !== "unionpay")
				.map(card => card.toUpperCase()),
		},
	});

	private _composeGooglePayIsReadyData = (): void => {
		this._googlePayIsReadyData = {
			apiVersion: 2,
			apiVersionMinor: 0,
			allowedPaymentMethods: [this._composeAllowedPaymentMethod()],
		};
	};

	private _composeGooglePayDataRequest = (): void => {
		const merchantConfig: IMerchantConfig<IGooglePaySettings> | null = this._configService.merchantConfig
			?.find(config => config.name === MerchantsList.GOOGLE_PAY) as IMerchantConfig<IGooglePaySettings> || null;

		if (
			merchantConfig
		) {
			const allowedPaymentMethod: IGooglePaymentAllowedPaymentMethod = {
				...this._composeAllowedPaymentMethod(),
				tokenizationSpecification: {
					type: "PAYMENT_GATEWAY",
					parameters: {
						gatewayMerchantId: merchantConfig.settings
							? merchantConfig.settings.checkout_id
							: "",
					},
				},
			};

			this._googlePayDataRequest = {
				apiVersion: 2,
				apiVersionMinor: 0,
				merchantInfo: {
					merchantId: merchantConfig.settings
						? merchantConfig.settings.merchant_id
						: "",
					merchantName: merchantConfig.settings
						? merchantConfig.settings.merchant_name
						: "",
				},
				allowedPaymentMethods: [allowedPaymentMethod],
				transactionInfo: {
					currencyCode: this._configService.config?.configFromConnector.paymentDetails?.currency || "USD",
					totalPrice: this._configService.config?.configFromConnector.paymentDetails?.amount || "0",
					totalPriceStatus: "FINAL",
				},
			};
		}
	};

	private _attachGPayButton = (): void => {
		const button = this._gPayClient.createButton({ onClick: this._onGPayBtnClicked, buttonType: "short", });
		const buttonElement = document.getElementById(GOOGLE_PAY_BUTTON_ID);
		if (buttonElement) {
			buttonElement.appendChild(button);
		}
	};

	private _onGPayBtnClicked = async (): Promise<void> => {
		const paymentData = await this._gPayClient.loadPaymentData(this._googlePayDataRequest);
		await this._addCreditCard(paymentData);
	};

	private _initGPayClient = (): void => {
		if (!this._gPayClient) {
			this._gPayClient = new window.google.payments.api.PaymentsClient({
				environment: env.toUpperCase() === GooglePayEnv.PRODUCTION ? GooglePayEnv.PRODUCTION : GooglePayEnv.TEST,
			});
		}
	};

	private _onGPayLibLoader = async (): Promise<void> => {
		this._initGPayClient();
		const response = await this._gPayClient.isReadyToPay(this._googlePayIsReadyData);
		if (response) {
			this._attachGPayButton();
		}
	};

	private _attachGooglePayLibrary = (): void => {
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = GOOGLE_PAY_LIB_URL;
		script.onload = this._onGPayLibLoader;
		document.body.appendChild(script);
	};

	private _addCreditCard = async (paymentData: IPaymentMethodData): Promise<void> => {
		const paymentProvider: CreditCardProvider = this._configService.config?.configFromAPI.general.creditCardProvider.name || CreditCardProvider.CARD;
		const accessToken: string = this._userService.authParamsData?.accessToken || "";
		await this._repo.addCard(paymentData, paymentProvider, accessToken);
	};

	public init = (): void => {
		this._repo = googlePayProviderInjector.get<IGooglePayProviderRepo>(GOOGLE_PAY_PROVIDER_REPO);
		this._configService = globalInjector.get<IConfiguratorService>(CONFIGURATION_SERVICE);
		this._userService = globalInjector.get<IUserService>(USER_SERVICE);
		this._composeGooglePayIsReadyData();
		this._composeGooglePayDataRequest();
		this._attachGooglePayLibrary();
	};
}
