import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const STEPS = ['base', 'sauce', 'cheese', 'vegetables'];

export default function PizzaBuilder() {
  const [options, setOptions] = useState(null);
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState({ base: '', sauce: '', cheese: '', vegetables: [] });
  const nav = useNavigate();

  useEffect(() => { api.getOptions().then(setOptions); }, []);

  if (!options) return <div className="page"><p>Loading options...</p></div>;

  const toggleVeg = (name) => {
    setSelection(s => ({
      ...s,
      vegetables: s.vegetables.includes(name) ? s.vegetables.filter(v => v !== name) : [...s.vegetables, name],
    }));
  };

  const canNext = () => {
    if (STEPS[step] === 'vegetables') return true; // optional, multi-select
    return !!selection[STEPS[step]];
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else nav('/order-summary', { state: selection });
  };

  const listFor = {
    base: options.bases, sauce: options.sauces, cheese: options.cheeses, vegetables: options.vegetables,
  }[STEPS[step]];

  return (
    <div className="page">
      <h1>Build your pizza</h1>
      <p className="hint">Step {step + 1} of {STEPS.length}: choose your {STEPS[step]}</p>

      <div className="options-grid">
        {listFor.map(item => {
          const isVeg = STEPS[step] === 'vegetables';
          const selected = isVeg ? selection.vegetables.includes(item.name) : selection[STEPS[step]] === item.name;
          return (
            <button
              type="button"
              key={item.id}
              className={`option ${selected ? 'selected' : ''}`}
              onClick={() => isVeg ? toggleVeg(item.name) : setSelection({ ...selection, [STEPS[step]]: item.name })}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="wizard-nav">
        <button disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        <button className="primary" disabled={!canNext()} onClick={next}>
          {step === STEPS.length - 1 ? 'Review order' : 'Next'}
        </button>
      </div>
    </div>
  );
}
