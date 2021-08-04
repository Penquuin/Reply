import Rokux from "@rbxts/rokux";
import { Store } from "@rbxts/rokux/out/rokux";
import { expect } from "chai";

import { CreateServerStore } from "../src/create-server-store"
import "mocha";
import { AdditionServerActions, TEnhancement } from "../src/utility";

interface IServerState {
	Cookies: number;
}

interface ISharedState {
	Cakes: number;
}

interface IEatCookies extends Rokux.Action<"EatCookies"> {}
interface IEatCakes extends Rokux.Action<"EatCakes"> {}

type TServerActions = IEatCookies;
type TSharedActions = IEatCakes;

const DefaultServerState: IServerState = { Cookies: 5 };
const DefaultSharedState: ISharedState = { Cakes: 8 };

const ServerReducer = Rokux.CreateReducer<IServerState, TServerActions>({
	EatCookies: (s, a) => {
		s.Cookies -= 1;
		return s;
	},
});

const SharedReducer = Rokux.CreateReducer<ISharedState, TSharedActions>({
	EatCakes: (s, a) => {
		s.Cakes -= 1;
		return s;
	},
});

describe("CreateServerStore", () => {
	let store: Store<TEnhancement<IServerState, ISharedState>, AdditionServerActions<TServerActions, TSharedActions>>;
	let EatCakesCount = 0;
	beforeEach(() => {
		store = CreateServerStore<IServerState, TServerActions, ISharedState, TSharedActions>(
			ServerReducer,
			SharedReducer,
			DefaultServerState,
			DefaultSharedState,
			(action: TSharedActions) => {
				if (
					((x: TSharedActions): x is IEatCakes => {
						return x.type === "EatCakes";
					})(action)
				) {
					EatCakesCount++;
				}
			},
		);
	});
	it("Actions should influence merged store X. Where X should encapsulize input generic S.", (done) => {
		for (let i = 0; i < 3; i++) {
			store.Dispatch({ type: "EatCookies" });
		}
		const expected = DefaultServerState.Cookies - 3;
		expect(store.GetState().Cookies).to.equal(expected);
	});
});
