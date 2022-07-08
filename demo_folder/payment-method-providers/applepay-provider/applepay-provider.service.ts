import { ApplePaySession, } from "braintree-web";
import base64 from "base-64";
import { IUserService, USER_SERVICE, } from "@wallet-app/user/user.service";
import {
	APPLEPAY_PROVIDER_REPO,
	IApplePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.repo";
import {
	applePayProviderInjector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.injector";
import { CONFIGURATION_SERVICE, IConfiguratorService, } from "@wallet-app/configurator/configurator.service";
import { globalInjector, } from "@wallet-app/infrastructure/dependency-injector/injector";
import { makeAutoObservable, } from "mobx";
import { IApplePaySettings, IMerchantConfig, MerchantsList, } from "@wallet-app/payments/payments.types";
import {
	IApplePayAuthorizedData, IApplePaymentToken,
	IApplePayPaymentRequest, IApplePaySessionResponseData, IApplePayValidateEvent,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.types";

export const APPLEPAY_PROVIDER_SERVICE = "APPLEPAY_PROVIDER_SERVICE";
// It will be updated over time. No API provides version list
const APPLEPAY_VERSIONS: number[] = [8, 9, 10, 11, 12];

export interface IApplePayProviderService {
	init: () => void;
}

export class ApplePayProviderService implements IApplePayProviderService {
	private _repo!: IApplePayProviderRepo;
	private _userService!: IUserService;
	private _configService!: IConfiguratorService;

	constructor() {
		makeAutoObservable<IApplePayProviderService>(this);
	}

	private _checkIsApplePaySupported = (): boolean => {
		return window.ApplePaySession && window.ApplePaySession.canMakePayments();
	};

	private _getSupportedApplePayVersion = (): number | null => {
		const supportedVersions: number[] = APPLEPAY_VERSIONS.filter((version) => window.ApplePaySession.supportsVersion(version));
		return supportedVersions.length ? supportedVersions[supportedVersions.length - 1] : null;
	};

	private _composeApplePayInstanceRequest = (): IApplePayPaymentRequest | null => {
		const merchantConfig: IMerchantConfig<IApplePaySettings> | null = this._configService.merchantConfig
		?.find(config => config.name === MerchantsList.APPLEPAY) as IMerchantConfig<IApplePaySettings> || null;
		if (
			merchantConfig
			&& merchantConfig.settings
		) {
			const supportedNetworks: string[] = this._configService.composeSupportedCreditCardTypesList()
			.filter(card => card.toLowerCase() !== "diners" || card.toLocaleLowerCase() !== "unionpay");

			return {
				supportedNetworks,
				countryCode: merchantConfig.settings.country_code,
				currencyCode: merchantConfig.settings.pre_auth_text,
				merchantCapabilities: ["support3DS"],
				total: {
					label: merchantConfig.settings.pre_auth_text,
					amount: this._configService.config?.configFromConnector.paymentDetails?.amount || "0",
					type: "final",
				},
			};
		}
		return null;
	};

	private _initApplePayInstance = () => {
		const request: IApplePayPaymentRequest | null = this._composeApplePayInstanceRequest();
		if (request) {
			const applePaySession: ApplePaySession = new window.ApplePaySession(
				this._getSupportedApplePayVersion(),
				this._composeApplePayInstanceRequest()
			);

			applePaySession.onvalidatemerchant = async (event: IApplePayValidateEvent) => {
				await this._validateMerchant(applePaySession, event);
			};
			applePaySession.onpaymentauthorized = this._authorizeApplePayment;
		}
	};

	private _validateMerchant = async (applePaySession: ApplePaySession, event: IApplePayValidateEvent): Promise<void> => {
		const session: IApplePaySessionResponseData = await this._repo.getSession(event.validationURL);
		applePaySession.completeMerchantValidation(session);
	};

	private _authorizeApplePayment = async (event: IApplePayAuthorizedData): Promise<void> => {
		const paymentResponse: IApplePaymentToken = event.payment.token;
		const newToken: string = base64.encode(JSON.stringify(paymentResponse.paymentData));
		const cardType: string = paymentResponse.paymentMethod.network.toLowerCase();
		const accessToken: string = this._userService.authParamsData?.accessToken || "";

		await this._repo.addCard(accessToken, newToken, { cardType, });
	};

	public init = (): void => {
		this._repo = applePayProviderInjector.get<IApplePayProviderRepo>(APPLEPAY_PROVIDER_REPO);
		this._userService = globalInjector.get<IUserService>(USER_SERVICE);
		this._configService = globalInjector.get<IConfiguratorService>(CONFIGURATION_SERVICE);
		if (this._checkIsApplePaySupported()) {
			this._initApplePayInstance();
		}
	};
}
