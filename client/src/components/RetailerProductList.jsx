import React, { useRef, useState } from 'react';

const RetailerProductList = ({ products, onEdit, onDelete }) => {
  const railRef = useRef(null);
  const dragStateRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0, pointerId: null });
  const [isDragging, setIsDragging] = useState(false);

  const isInteractiveElement = (target) => {
    return Boolean(target?.closest('button, a, input, textarea, select, label'));
  };

  const scrollRail = (direction) => {
    if (!railRef.current) return;
    const amount = 460;
    railRef.current.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    if (!railRef.current || event.pointerType === 'touch' || isInteractiveElement(event.target)) return;

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: railRef.current.scrollLeft,
      pointerId: event.pointerId,
    };
    setIsDragging(true);
    railRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!railRef.current || !dragStateRef.current.isDragging) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    railRef.current.scrollLeft = dragStateRef.current.scrollLeft - deltaX;
  };

  const endDrag = (event) => {
    if (!dragStateRef.current.isDragging) return;

    dragStateRef.current.isDragging = false;
    setIsDragging(false);

    if (railRef.current && dragStateRef.current.pointerId !== null) {
      try {
        railRef.current.releasePointerCapture(dragStateRef.current.pointerId);
      } catch {
        // Ignore capture release issues if the pointer already left the element.
      }
    }

    dragStateRef.current.pointerId = null;
  };

  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-app bg-surface-2 p-8 text-center">
        <div className="text-lg font-black text-foreground">No products yet</div>
        <p className="mt-2 text-sm text-muted">Add your first item to start building your storefront.</p>
      </div>
    );
  }

  const defaultSVG =
    'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect fill="%23e0e7ef" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="40" fill="%239ca3af">🛒</text></svg>';

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-muted">Catalog Preview</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">Your Products</h3>
        </div>
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-app bg-surface-2 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Drag to scroll
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollRail(-1)}
        className="hidden xl:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-app bg-surface text-foreground shadow-app transition hover:bg-surface-2"
        aria-label="Scroll products left"
      >
        <span className="text-2xl leading-none">‹</span>
      </button>

      <button
        type="button"
        onClick={() => scrollRail(1)}
        className="hidden xl:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-app bg-surface text-foreground shadow-app transition hover:bg-surface-2"
        aria-label="Scroll products right"
      >
        <span className="text-2xl leading-none">›</span>
      </button>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-[var(--surface)] via-[color-mix(in_srgb,var(--surface)_80%,transparent)] to-transparent xl:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-[var(--surface)] via-[color-mix(in_srgb,var(--surface)_80%,transparent)] to-transparent xl:block" />

      <div
        ref={railRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        className={`flex gap-3 overflow-x-auto pb-3 pr-2 snap-x snap-mandatory scroll-smooth select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {products.map((product) => (
          <article key={product._id} className="group snap-start flex-none w-[320px] sm:w-[340px] lg:w-[380px] xl:w-[420px] overflow-hidden rounded-[1.75rem] border border-app bg-surface shadow-app transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(0,0,0,0.22)]">
            <div className="relative overflow-hidden bg-gradient-to-br from-[var(--surface-2)] via-[var(--surface)] to-[var(--surface-2)] aspect-[4/3]">
              <img
                src={product.image ? `${product.image}?t=${new Date(product.updatedAt).getTime()}` : defaultSVG}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultSVG; }}
              />
              <div className="absolute left-3 top-3 rounded-full bg-[var(--surface)]/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground shadow-sm backdrop-blur border border-app">
                Live
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <h4 className="text-lg font-black text-foreground leading-tight tracking-tight truncate" title={product.name}>{product.name}</h4>

                <div className="mt-3 flex flex-wrap gap-2 min-h-7">
                  {product.category && (
                    <span className="rounded-full bg-surface-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted border border-app">{product.category}</span>
                  )}
                  {product.brand && (
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-950/30 dark:text-sky-300">{product.brand}</span>
                  )}
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] border ${Number(product.countInStock) > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900'}`}>
                    {Number(product.countInStock) > 0 ? `Stock ${product.countInStock}` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <p className="line-clamp-2 text-sm leading-6 text-muted min-h-12">
                {product.description || 'No description added yet.'}
              </p>

              <div className="flex items-end justify-between gap-3 border-t border-app pt-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-black">Price</p>
                  <p className="mt-1 text-2xl font-black text-foreground tabular-nums">₹{product.price}</p>
                </div>
                <button
                  className="rounded-xl border border-primary/20 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-[0.06em] text-white shadow-sm transition hover:opacity-90"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit(product);
                  }}
                >
                  Edit
                </button>
              </div>

              {onDelete && (
                <button
                  className="mt-3 w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(product._id);
                  }}
                >
                  Delete Product
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.28em] text-muted xl:hidden">
        <span>Swipe to browse products</span>
        <span>{products.length} items</span>
      </div>
    </div>
  );
};

export default RetailerProductList;
