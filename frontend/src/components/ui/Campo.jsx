// Campo de formulário com rótulo, dica e mensagem de erro (RNF04, RNF05)
// Uso: <Campo rotulo="Título" erro={erros.titulo} obrigatorio>
//        <input ... />
//      </Campo>
import { cloneElement, useId } from 'react';

export default function Campo({ rotulo, erro, dica, obrigatorio = false, children, className = '' }) {
  const id = useId();
  const idDica = dica ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;

  const controle = cloneElement(children, {
    id,
    'aria-invalid': erro ? true : undefined,
    'aria-describedby': [idDica, idErro].filter(Boolean).join(' ') || undefined,
    required: obrigatorio || children.props.required,
  });

  return (
    <div className={`campo ${erro ? 'campo--erro' : ''} ${className}`}>
      <label htmlFor={id}>
        {rotulo}
        {obrigatorio && <span className="campo__obrigatorio" aria-hidden="true"> *</span>}
      </label>
      {controle}
      {dica && !erro && (
        <small id={idDica} className="campo__dica">
          {dica}
        </small>
      )}
      {erro && (
        <small id={idErro} className="campo__mensagem-erro" role="alert">
          {erro}
        </small>
      )}
    </div>
  );
}
