import { useEffect, type RefObject } from "react";

/**
 * Llama a `onFuera` en cuanto se toca/hace clic fuera del elemento
 * referenciado — para resetear un gráfico a su estado inicial cuando el
 * usuario se va a otra parte de la pantalla, no solo cuando toca dentro
 * del propio gráfico.
 */
export function useClicFuera(ref: RefObject<HTMLElement | null>, onFuera: () => void) {
  useEffect(() => {
    function manejar(evento: PointerEvent) {
      if (ref.current && !ref.current.contains(evento.target as Node)) onFuera();
    }
    document.addEventListener("pointerdown", manejar);
    return () => document.removeEventListener("pointerdown", manejar);
  }, [ref, onFuera]);
}
