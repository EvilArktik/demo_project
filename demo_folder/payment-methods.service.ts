import { makeAutoObservable, } from "mobx";
import {
	IPaymentMethodsConnector,
} from "@wallet-app/payments/payment-methods/payment-method-providers/payment-methods.connector";
import {
	ICardInputData,
	IPaymentMethod,
	PaymentMethodProviders,
} from "@wallet-app/payments/payment-methods/payment-methods";
import { CONFIGURATION_SERVICE, IConfiguratorService, } from "@wallet-app/configurator/configurator.service";
import { globalInjector, } from "@wallet-app/infrastructure/dependency-injector/injector";
import { IPaymentMethodsRepo, PAYMENT_METHODS_REPO, } from "@wallet-app/payments/payment-methods/payment-methods.repo";
import { paymentMethodsInjector, } from "@wallet-app/payments/payment-methods/payment-methods.injector";
import { IUserService, USER_SERVICE, } from "@wallet-app/user/user.service";
import { ICheckoutData, MerchantsList, } from "@wallet-app/payments/payments.types";
import { CreditCardProvider, } from "@wallet-app/configurator/configurator.types";
import {
	cvvManagerInjector,
	setupCVVInjector,
} from "@wallet-app/payments/payment-methods/cvv-manager/cvv-manager.injector";
import {
	CVV_MANAGER_SERVICE,
	ICvvManagerService,
} from "@wallet-app/payments/payment-methods/cvv-manager/cvv-manager.service";
import {
	GooglePayProviderClient,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.client";
import {
	ApplePayProviderClient,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.client";

export const PAYMENT_METHODS_SERVICE = "PAYMENT_METHODS_SERVICE";

// [IMPORTANT]: Don't forget to add new payment providers here!!!
const PAYMENT_METHOD_CLIENTS: { [key: string]: IPaymentMethodsConnector } = {
	[PaymentMethodProviders.GooglePay]: new GooglePayProviderClient(),
	[PaymentMethodProviders.ApplePay]: new ApplePayProviderClient(),
};

export interface IPaymentMethodsService {
	paymentMethods: IPaymentMethod[];
	getCurrentPaymentMethod: () => IPaymentMethod | null;
	getPaymentMethods: () => Promise<void>;
	addPaymentMethod: (type: PaymentMethodProviders, cardInputData?: ICardInputData) => Promise<void>;
	deletePaymentMethod: (id: string) => Promise<void>;
	setCurrentDefaultPayment: (id: string) => Promise<void>;
	getCheckoutData: () => Promise<ICheckoutData | null>;
	init: () => void;
}

export class PaymentMethodsService implements IPaymentMethodsService {
	private _userService!: IUserService;
	private _configService!: IConfiguratorService;
	private _pmRepo!: IPaymentMethodsRepo;
	private _cvvManagerService!: ICvvManagerService;

	public paymentMethods: IPaymentMethod[] = [];

	constructor() {
		makeAutoObservable<IPaymentMethodsService>(this);
	}

	init = (): void => {
		setupCVVInjector();
		this._configService = globalInjector.get<IConfiguratorService>(CONFIGURATION_SERVICE);
		this._userService = globalInjector.get<IUserService>(USER_SERVICE);
		this._pmRepo = paymentMethodsInjector.get<IPaymentMethodsRepo>(PAYMENT_METHODS_REPO);
		this._cvvManagerService = cvvManagerInjector.get<ICvvManagerService>(CVV_MANAGER_SERVICE);
		this._initPaymentMethods();
	};

	private _initPaymentMethods = () => {
		if (this._configService.config) {
			const alternativePMs = this._configService.composeAcceptedPaymentMethodsList();
			alternativePMs.push(this._configService.config.configFromAPI.general.creditCardProvider.name);

			for (const paymentMethodKey in PAYMENT_METHOD_CLIENTS) {
				if (alternativePMs.find(pm => paymentMethodKey.toLowerCase() === pm)) {
					PAYMENT_METHOD_CLIENTS[paymentMethodKey].init();
				}
			}
		}
	};

	public getCheckoutData = async (): Promise<ICheckoutData | null> => {
		const currentPaymentMethod: IPaymentMethod | null = await this.getCurrentPaymentMethod();
		if (currentPaymentMethod && currentPaymentMethod.source === MerchantsList.CARD) {
			const cvvRecord = this._cvvManagerService.readCVVFromStorage(currentPaymentMethod?.id);

			return {
				ccToken: currentPaymentMethod.ccToken,
				encryptedCVV: cvvRecord?.encryptedCVV,
			};
		}

		return null;
	};

	public getPaymentMethods = async (): Promise<void> => {
		this.paymentMethods = await this._pmRepo.getPaymentMethods(false);
	};

	public addPaymentMethod = async (type: PaymentMethodProviders, cardInputData: ICardInputData | undefined): Promise<void> => {
		if (PAYMENT_METHOD_CLIENTS[type].addNewCard) {
			await PAYMENT_METHOD_CLIENTS[type].addNewCard?.(cardInputData);
			await this.getPaymentMethods();
		}
	};

	public getCurrentPaymentMethod = (): IPaymentMethod | null => {
		return this.paymentMethods.find(pm => pm.isDefault) || null;
	};

	public deletePaymentMethod = async (id: string): Promise<void> => {
		this.paymentMethods = await this._pmRepo.deletePaymentMethod(id);
		await this._connect3DS();
	};

	public setCurrentDefaultPayment = async (id: string): Promise<void> => {
		this.paymentMethods = await this._pmRepo.setCurrentDefaultPayment(id, false);
		await this._connect3DS();
	};
}
