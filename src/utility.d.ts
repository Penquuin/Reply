import Rokux from "@rbxts/rokux";

/**
 * This acts as a shared action that is usable in both sides.
 */
export interface I_OnSharedDispatched<T> extends Rokux.Action<"_OnSharedDispatched"> {
	Action: T;
}
/**
 * This is an expensive action. Use it for
 * several times per gameplay is enough.
 */
export interface IRefreshShared<SS> extends Rokux.Action<"RefreshShared"> {
	state: SS;
}
/**
 * This is an enhancement that plugs _Shared property to both sides
 * implicitly. Normal users won't notice it very much.
 */
export type TEnhancement<S, SS> = S & { _Shared: SS };

export type AdditionServerActions<A extends Rokux.Action, SA extends Rokux.Action> = A | I_OnSharedDispatched<SA>;
