export interface IApplePayAddCardExtraParams {
	cardType: string;
}

export interface IApplePayAddCardRequest {
	accessToken: string;
	source: string;
	externalToken: string;
	extraParams: IApplePayAddCardExtraParams;
}

export interface IApplePayPaymentRequestTotalObj {
	label: string;
	amount: string;
	type: string;
}

export interface IApplePayPaymentRequest {
	countryCode: string;
	currencyCode: string;
	supportedNetworks: string[];
	merchantCapabilities: string[];
	total: IApplePayPaymentRequestTotalObj;
}

export interface IApplePaySessionResponseData {
	epochTimestamp: number;
	expiresAt: number;
	merchantSessionIdentifier: string,
	nonce: string;
	merchantIdentifier: string;
	domainName: string;
	displayName: string;
	signature: string;
	operationalAnalyticsIdentifier: string;
	retries: number;
	pspId: string;
}

export interface IApplePaySessionResponse {
	response: IApplePaySessionResponseData;
	status: string;
}

export interface IApplePayValidateEvent {
	validationURL: string;
}

export interface IApplePayPaymentMethod {
	displayName: string;
	network: string;
}

export interface IApplePaymentToken {
	paymentData: any;
	transactionIdentifier: string;
	paymentMethod: IApplePayPaymentMethod;
}

export interface IApplePayAuthorizedPayment {
	token: IApplePaymentToken;
}

export interface IApplePayAuthorizedData {
	payment: IApplePayAuthorizedPayment;
}
