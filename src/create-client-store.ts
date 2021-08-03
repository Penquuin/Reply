import Rokux from "@rbxts/rokux";
import { Reducer, ReadonlyMiddleware } from "@rbxts/rokux/out/rokux-types";
import { IsRefreshShared, IsSharedDispatched } from "guards";
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
	SharedMiddleware?: ReadonlyMiddleware<SS, SA>,
) {
	const EnhancedState: TEnhancement<S, SS> = {
		...DefaultState,
		_Shared: DefaultSharedState,
	};

	type EnhancedClientActions = A | IRefreshShared<SS> | I_OnSharedDispatched<SA>;
	const CombinedReducer = (state: TEnhancement<S, SS>, action: EnhancedClientActions): TEnhancement<S, SS> => {
		if (IsRefreshShared<EnhancedClientActions, SS>(action)) {
			state._Shared = action.state;
			return state;
		} else if (IsSharedDispatched<EnhancedClientActions, SA>(action)) {
			state._Shared = SharedReducer(state._Shared, action.Action);
			return state;
		} else {
			//client action
			const result = ClientReducer(state as S, action);
			return {
				...result,
				_Shared: state._Shared,
			};
		}
	};
	const CreateClientMiddleware = (): Rokux.ReadonlyMiddleware<TEnhancement<S, SS>, EnhancedClientActions> => {
		return (nextDispatch, state) => {
			return (action) => {
				if (IsSharedDispatched<EnhancedClientActions, SA>(action)) {
					if (SharedMiddleware) {
						const sharedresult = SharedMiddleware((SAction) => {
							return SharedReducer(state._Shared, SAction);
						}, state._Shared)(action.Action);
						return {
							...state,
							_Shared: sharedresult,
						};
					}
					return nextDispatch(action);
				} else if (IsRefreshShared<EnhancedClientActions, SS>(action)) {
					return nextDispatch(action);
				}
				if (Middleware) {
					const clientresult = Middleware((AAction) => {
						return ClientReducer(state as S, AAction);
					}, state as S)(action);
					return {
						...clientresult,
						_Shared: state._Shared,
					};
				} else {
					const clientresult = ClientReducer(state as S, action);
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
