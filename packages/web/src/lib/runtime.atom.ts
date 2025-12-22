import { Atom } from "@effect-atom/atom-react";
import { Layer } from "effect";

export const runtimeAtom = Atom.runtime(Layer.empty);
