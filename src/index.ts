import {
	I_OnSharedDispatched as i_OnSharedDispatched,
	IRefreshShared as iRefreshShared,
	TEnhancement as tEnhancement,
} from "utility";
import { CreateClientStore as createClientStore } from "create-client-store";
import { CreateServerStore as createServerStore } from "create-server-store";

namespace Reply {
	export const CreateClientStore: typeof createClientStore = createClientStore;
	export const CreateServerStore: typeof createServerStore = createServerStore;

	export type I_OnSharedDispatched<T> = i_OnSharedDispatched<T>;
	export type IRefreshShared<SS> = iRefreshShared<SS>;
	export type TEnhancement<S, SS> = tEnhancement<S, SS>;
}
export default Reply;
