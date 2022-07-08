import { Injector, } from "@wallet-app/infrastructure/dependency-injector/injector";
import {
	GOOGLE_PAY_PROVIDER_REPO,
	IGooglePayProviderRepo,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.repo";
import {
	GooglePayProviderRepoImpl,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/api/googlepay-provider.repo.impl";
import {
	GOOGLE_PAY_PROVIDER_SERVICE, GooglePayProviderService,
	IGooglePayProviderService,
} from "@wallet-app/payments/payment-methods/payment-method-providers/googlepay-provider/googlepay-provider.service";

export const googlePayProviderInjector = new Injector();

// [WARNING]: DEPENDENCIES INJECTIONS ARE ORDER SENSITIVE;

export function setupGooglePayProviderInjector() {
	// [INFO]: REPOS GOES FIST
	googlePayProviderInjector.set<IGooglePayProviderRepo>(GOOGLE_PAY_PROVIDER_REPO, new GooglePayProviderRepoImpl());

	// [INFO]: SERVICES GOES SECOND BECAUSE THEY DEPEND ON REPOS
	googlePayProviderInjector.set<IGooglePayProviderService>(GOOGLE_PAY_PROVIDER_SERVICE, new GooglePayProviderService());
}
