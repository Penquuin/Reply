/// <reference types="@rbxts/testez/globals" />

import Reply from "@rbxts/reply";
import Rokux from "@rbxts/rokux"

//State def
interface IServer {
    Cookies: number
}
interface IShared {
    Cakes: number
}
//Action def
interface IEatCookie extends Rokux.Action<"EatCookie"> {}
type TServerActions = IEatCookie;

interface IEatCake extends Rokux.Action<"EatCake"> {}
type TSharedActions = IEatCake;

const ServerReducer = Rokux.CreateReducer<IServer, TServerActions>({
    EatCookie: (s, _) => {
        s.Cookies -= 1;
        return s;
    }
})

const SharedReducer = Rokux.CreateReducer<IShared, TSharedActions>({
    EatCake: (s, _) => {
        s.Cakes -= 1;
        return s;
    }
})

const store = Reply.CreateServerStore<IServer,
    TServerActions,
    IShared,
    TSharedActions>
    (
        ServerReducer,
        SharedReducer,
        { Cookies: 10 },
        { Cakes: 5 },
        (action) => {
        }
    );


export = () => {
    describe("Store<TEnhancement<S,SS>,EnhancedA<A,SA>>", () => {
        it("should respond to A's influence", () => {
            const loop = math.random(2, 10);
            const expected = store.GetState().Cookies - loop;
            for (let i = 0; i < loop; i++) {
                store.Dispatch({type:"EatCookie"})
            }
            expect(store.GetState().Cookies === expected).to.be.ok();
        })
        it("._Shared should respond to SA's influence", () => {
            const loop = math.random(2, 10);
            const expected = store.GetState()._Shared.Cakes - loop;
            for (let i = 0; i < loop; i++) {
                store.Dispatch({type:"_OnSharedDispatched",Action:{type:"EatCake"}})
            }
            expect(store.GetState()._Shared.Cakes === expected).to.be.ok();
        })
    })
}