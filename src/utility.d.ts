import Rokux from "@rbxts/rokux";

/**
 * This acts as a shared action that is usable in both sides.
 */
interface I_OnSharedDispatched<T> extends Rokux.Action<"_OnSharedDispatched"> {
	Action: T;
}
/**
 * This is an expensive action. Use it for
 * several times per gameplay is enough.
 */
interface IRefreshShared<SS> extends Rokux.Action<"RefreshShared"> {
	state: SS;
}
/**
 * This is an enhancement that plugs _Shared property to both sides
 * implicitly. Normal users won't notice it very much.
 */
type TEnhancement<S, SS> = S & { _Shared: SS };
