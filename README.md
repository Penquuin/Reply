# Reply

A lightweight optimized Rokux store replicator.

## Why you should use Reply and Rodux/Rokux

The bigger your game expands, the more likely you will find it harder and harder to
manage the state of the server and clients. This is where Rodux/Rokux comes into play.
They are both similar modules that helps with state management. But this is not enough,
it is complex to build a secured store replication system that conserves the receiver's
state while replicating to it. This is when Reply comes into play, it simplifies the
process of creating two stores with auto replication.

### Constraints

Currently Reply only supports _directional_ communication from server to client.
But you can create your own inverse communication process. It also highly depends
on Rokux.

[Demo]()