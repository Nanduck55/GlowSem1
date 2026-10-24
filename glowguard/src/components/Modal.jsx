export default function Modal({ open, onClose, title, children, wide, xl }) {
  if (!open) return null
  return (
    <div className={`fixed inset-0 z-[10000] bg-ink/60 backdrop-blur-sm flex items-center justify-center ${xl ? 'p-1.5 sm:p-4' : 'p-4'}`}
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-3xl shadow-pop w-full ${xl ? 'max-w-4xl' : wide ? 'max-w-2xl' : 'max-w-md'} ${xl ? 'max-h-[96vh] sm:max-h-[92vh]' : 'max-h-[90vh]'} overflow-y-auto animate-[fadeUp_.3s_ease]`}
           style={{ animation: 'fadeUp .3s ease' }}>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`}</style>
        <div className="px-7 pt-6 pb-4 flex items-start justify-between border-b border-gg-100">
          <h3 className="text-xl font-extrabold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close"
                  className="text-muted hover:text-ink text-xl leading-none transition">&times;</button>
        </div>
        <div className={xl ? 'p-4 sm:p-7' : 'p-7'}>{children}</div>
      </div>
    </div>
  )
}