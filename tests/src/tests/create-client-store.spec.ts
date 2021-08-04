import Reply from "@rbxts/reply";
import Rokux from "@rbxts/rokux";

/**
 * Before starting to read this unit test, here are several things you
 * must be aware of. Firstly, this test creates a pseudo network in
 * order to simulate data communication. Second, this test will examine
 * the synchronization of _Shared. However there are no ways to clean
 * up signals. Instead, I will use callbacks.
 */

namespace PN {
    export class SadSignal<C extends Callback> {
        Name: string;
        Cb: C|undefined;
        constructor(name:string) {
            this.Name = name;
        }
        fire(...args: unknown[]) {
            if (this.Cb) {
                this.doCallback(args);
            }
        }
        doCallback(...args: unknown[]) {
            if (this.Cb) {
                this.Cb(args);
            }
        }
        setCallback(cb: C) {
            this.Cb = cb;
        }
    }
    export class PseudoNetwork {
        signals: SadSignal<any>[] = [];
        register(s: SadSignal<any>): void {
            this.signals.push(s);
        }
        connectTo(sName: string,cb:Callback): boolean {
            this.signals.forEach(s => {
                if (s.Name===sName) {
                    s.setCallback(cb);
                    return true;
                }
            });
            return false
        }
        disconnect(sName: string): boolean {
            this.signals.forEach(s => {
                if (s.Name===sName) {
                    s.setCallback(undefined);
                    return true;
                }
            });
            return false
        }
    }
}

//State def
interface IServer {
    Initialized: boolean
}

interface IClient {
    Cats: number;
}

interface IShared {
    Dogs: number;
}

//Actions def
interface ICatReproduced extends Rokux.Action<"CatReproduced"> {}
interface IDogReproduced extends Rokux.Action<"DogReproduced"> {}
interface IInitServer extends Rokux.Action<"InitServer"> {}

type TClientActions = ICatReproduced;
type TSharedActions = IDogReproduced;
type TServerActions = IInitServer;

const ClientReducer = Rokux.CreateReducer<IClient, TClientActions>({
    CatReproduced: (s) => {
        s.Cats++;
        return s;
    }
})

const SharedReducer = Rokux.CreateReducer<IShared, TSharedActions>({
    DogReproduced: (s) => {
        s.Dogs++;
        return s;
    }
})

const ServerReducer = Rokux.CreateReducer<IServer, TServerActions>({
    InitServer: (s) => {
        s.Initialized = true;
        return s;
    }
})

const ClientStore = Reply.CreateClientStore<
    IClient,
    TClientActions,
    IShared,
    TSharedActions>(
        ClientReducer,
        SharedReducer,
        { Cats: 2 },
        { Dogs: 1 }
    );

const ServerStore = Reply.CreateServerStore<
    IServer,
    TServerActions,
    IShared,
    TSharedActions>(
        ServerReducer,
        SharedReducer,
        { Initialized: false },
        { Dogs: 1 },
        (sa) => {
            OnSharedDispatched.fire(sa);
        }
);

const Network = new PN.PseudoNetwork();
const OnSharedDispatched = new PN.SadSignal<(a:TSharedActions)=>void>("OnSharedDispatched");
Network.register(OnSharedDispatched);
Network.connectTo("OnSharedDispatched", (a: TSharedActions) => {
    ClientStore.Dispatch({ type: "_OnSharedDispatched", Action: a });
})

ClientStore.Dispatch({ type: "RefreshShared", state: ServerStore.GetState()._Shared });
export = () => {
    describe("Client Store", () => {
        it("Should receive server signal.", () => {
            ServerStore.Dispatch({ type: "_OnSharedDispatched", Action: { type: "DogReproduced" } });
            const expectedval = ServerStore.GetState()._Shared.Dogs;
            expect(ClientStore.GetState()._Shared.Dogs).to.be.equal(expectedval);
        })
    })
}