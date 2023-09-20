
import { expect } from "vitest";
import { toHaveError, toHaveAuthorizationError, toHaveAuthenticationError } from "@teamkeel/testing-runtime";

expect.extend({
	toHaveError,
	toHaveAuthorizationError,
	toHaveAuthenticationError,
});
			