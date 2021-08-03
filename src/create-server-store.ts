import Rokux from "@rbxts/rokux";
import { ReadonlyMiddleware, Reducer } from "@rbxts/rokux/out/rokux-types";
import { IsSharedDispatched } from "guards";
import { AdditionServerActions, I_OnSharedDispatched, TEnhancement } from "utility";
/**
 *
 * @param ServerReducer Your server's reducer
 * @param SharedReducer Your shared reducer
 * @param DefaultState The default status of your server store.
 * @param DefaultSharedState The default status of your shared store.
 * @param OnSharedActionDispatched The callback of action dispatches.
 * @param Middleware This is a middleware for your server.
 */
export function CreateServerStore<S, A extends Rokux.Action, SS, SA extends Rokux.Action>(
	ServerReducer: Reducer<S, A>,
	SharedReducer: Reducer<SS, SA>,
	DefaultState: S,
	DefaultSharedState: SS,
	OnSharedActionDispatched: (DispatchedAction: SA) => void,
	Middleware?: ReadonlyMiddleware<S, A>,
	SharedMiddleware?: ReadonlyMiddleware<SS, SA>,
) {
	const EnhancedState: TEnhancement<S, SS> = {
		...DefaultState,
		_Shared: DefaultSharedState,
	};
	type EnhancedServerActions = AdditionServerActions<A, SA>;
	const NewReducer = (State: TEnhancement<S, SS>, Action: EnhancedServerActions): TEnhancement<S, SS> => {
		if (IsSharedDispatched<EnhancedServerActions, SA>(Action)) {
			State._Shared = SharedReducer(State._Shared, Action.Action);
			return State;
		} else {
			const CastState = State as S;
			const result = ServerReducer(CastState, Action);
			State = {
				...result,
				_Shared: State._Shared,
			};
			return State;
		}
	};
	const CreateEnhancedMiddleware = (): Rokux.ReadonlyMiddleware<TEnhancement<S, SS>, EnhancedServerActions> => {
		return (nextDispatch, state) => {
			const CastedState = state as S;
			return (action) => {
				if (IsSharedDispatched<EnhancedServerActions, SA>(action)) {
					OnSharedActionDispatched(action.Action);
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
				} else {
					//server action
					let result: S;
					if (Middleware) {
						result = Middleware((AAction) => {
							return ServerReducer(CastedState, AAction);
						}, CastedState)(action);
					} else {
						result = ServerReducer(CastedState, action);
					}
					const desired: TEnhancement<S, SS> = {
						...result,
						_Shared: state._Shared,
					};
					return desired;
				}
			};
		};
	};
	const NewStore = new Rokux.Store<TEnhancement<S, SS>, EnhancedServerActions>(
		NewReducer,
		EnhancedState,
		CreateEnhancedMiddleware(),
	);
	return NewStore;
}
