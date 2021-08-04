import { ServerScriptService } from "@rbxts/services";
import TestEZ from "@rbxts/testez";

const result = TestEZ.TestBootstrap.run([ServerScriptService.WaitForChild("tests")]);
if (result.errors.size() > 0 || result.failureCount > 0) {
    error("Tests Failed!");
}