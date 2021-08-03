import Rokux from "@rbxts/rokux";
import { IRefreshShared, I_OnSharedDispatched } from "utility";

export function IsSharedDispatched<A extends Rokux.Action, SA extends Rokux.Action>(
	x: A | I_OnSharedDispatched<SA>,
): x is I_OnSharedDispatched<SA> {
	return x.type === "_OnSharedDispatched";
}

export function IsRefreshShared<A extends Rokux.Action, SS>(x: A | IRefreshShared<SS>): x is IRefreshShared<SS> {
	return x.type === "RefreshShared";
}
