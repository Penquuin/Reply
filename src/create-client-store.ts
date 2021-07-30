import Rokux from "@rbxts/rokux";
import { Reducer, ReadonlyMiddleware } from "@rbxts/rokux/out/rokux-types";
import { I_OnSharedDispatched, IRefreshShared, TEnhancement } from "utility";
/**
 *
 * @param ClientReducer Your client reducer.
 * @param SharedReducer Your shared reducer.
 * @param DefaultState The default status of your client store.
 * @param DefaultSharedState The default status of your shared store.
 * @param Middleware Your middleware.
 */
export function CreateClientStore<S, A extends Rokux.Action, SS, SA extends Rokux.Action>(
	ClientReducer: Reducer<S, A>,
	SharedReducer: Reducer<SS, SA>,
	DefaultState: S,
	DefaultSharedState: SS,
	Middleware?: ReadonlyMiddleware<S, A>,
) {
	const EnhancedState: TEnhancement<S, SS> = {
		...DefaultState,
		_Shared: DefaultSharedState,
	};

	type EnhancedClientActions = A | IRefreshShared<SS> | I_OnSharedDispatched<SA>;
	const CombinedReducer = (state: TEnhancement<S, SS>, action: EnhancedClientActions): TEnhancement<S, SS> => {
		if (action.type === "RefreshShared") {
			const CastedAction = action as IRefreshShared<SS>;
			state._Shared = CastedAction.state;
			return state;
		} else if (action.type === "_OnSharedDispatched") {
			const CastedAction = action as I_OnSharedDispatched<SA>;
			state._Shared = SharedReducer(state._Shared, CastedAction.Action);
			return state;
		} else {
			//client action
			const CastedAction = action as A;
			const result = ClientReducer(state as S, CastedAction);
			return {
				...result,
				_Shared: state._Shared,
			};
		}
	};
	const CreateClientMiddleware = (): Rokux.ReadonlyMiddleware<TEnhancement<S, SS>, EnhancedClientActions> => {
		return (nextDispatch, state) => {
			return (action) => {
				if (action.type === "RefreshShared" || action.type === "_OnSharedDispatched") {
					return nextDispatch(action);
				}
				const castedAction = action as A;
				if (Middleware) {
					const clientresult = Middleware((AAction) => {
						return ClientReducer(state as S, AAction);
					}, state as S)(castedAction);
					return {
						...clientresult,
						_Shared: state._Shared,
					};
				} else {
					const clientresult = ClientReducer(state as S, castedAction);
					return {
						...clientresult,
						_Shared: state._Shared,
					};
				}
			};
		};
	};
	const NewStore = new Rokux.Store<TEnhancement<S, SS>, EnhancedClientActions>(
		CombinedReducer,
		EnhancedState,
		CreateClientMiddleware(),
	);
	return NewStore;
}
