import { Environments, } from "@wallet-app/infrastructure/types";

// ------------ GPay API types ------------ //
export interface IPaymentInfo {
	cardNetwork: string;
	cardDetails: string;
}

export interface ITokenizationData {
	type: string;
	token: string;
}

export interface IPaymentMethodData {
	type: string;
	description: string;
	info: IPaymentInfo;
	tokenizationData: ITokenizationData;
}

export interface IPaymentData {
	apiVersion: number;
	apiVersionMinor: number;
	paymentMethodData: IPaymentMethodData;
}

export interface IGooglePayRequestBody {
	source: string;
	env: Environments;
	token: string;
	accessToken: string;
	ccType: string;
}

// ------------ GPay Data Request ------------ //

export interface IGooglePaymentDataRequestMerchantInfo {
	merchantName: string;
	merchantId: string;
}

export interface IAllowedPaymentMethodParams {
	allowedAuthMethods: string[];
	allowedCardNetworks: string[];
}

export interface ITokenizationSpecificParams {
	gateway: string;
	gatewayMerchantId: string;
}

export interface ITokenizationSpecific {
	type: string;
	parameters: ITokenizationSpecificParams;
}

export interface IGooglePaymentAllowedPaymentMethod {
	type: string;
	parameters: IAllowedPaymentMethodParams;
	tokenizationSpecification: ITokenizationSpecific;
}

export interface IGooglePaymentDataRequestTransactionInfo {
	totalPriceStatus: string;
	totalPrice: string;
	currencyCode: string;
}

export interface IGooglePaymentDataRequest {
	apiVersion: number;
	apiVersionMinor: number;
	merchantInfo: IGooglePaymentDataRequestMerchantInfo;
	allowedPaymentMethods: IGooglePaymentAllowedPaymentMethod[];
	transactionInfo: IGooglePaymentDataRequestTransactionInfo;
}

// ------------ GPay Is Ready To Pay Data ------------ //

export interface IGooglePaymentIsReadyToPayAllowedPM {
	type: string,
	parameters: IAllowedPaymentMethodParams
}

export interface IGooglePaymentIsReadyToPay {
	apiVersion: number;
	apiVersionMinor: number;
	allowedPaymentMethods: IGooglePaymentIsReadyToPayAllowedPM[];
}

export enum GooglePayEnv {
	PRODUCTION = "PRODUCTION",
	TEST = "TEST",
}
