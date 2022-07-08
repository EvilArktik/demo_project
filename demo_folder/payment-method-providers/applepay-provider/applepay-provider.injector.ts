import { Injector, } from "@wallet-app/infrastructure/dependency-injector/injector";
import {
	APPLEPAY_PROVIDER_REPO,
	IApplePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.repo";
import {
	ApplePayProviderRepoImpl,
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/api/applepay-provider.repo.impl";
import {
	APPLEPAY_PROVIDER_SERVICE, ApplePayProviderService,
	IApplePayProviderService
} from "@wallet-app/payments/payment-methods/payment-method-providers/applepay-provider/applepay-provider.service";

export const applePayProviderInjector = new Injector();

// [WARNING]: DEPENDENCIES INJECTIONS ARE ORDER SENSITIVE;

export function setupApplePayProviderInjector() {
	// [INFO]: REPOS GOES FIST
	applePayProviderInjector.set<IApplePayProviderRepo>(APPLEPAY_PROVIDER_REPO, new ApplePayProviderRepoImpl());

	// [INFO]: SERVICES GOES SECOND BECAUSE THEY DEPEND ON REPOS
	applePayProviderInjector.set<IApplePayProviderService>(APPLEPAY_PROVIDER_SERVICE, new ApplePayProviderService());
}
