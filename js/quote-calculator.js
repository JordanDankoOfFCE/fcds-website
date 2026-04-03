/* Quote Calculator — sends inputs to Cloudflare Worker, displays result */
(function () {
  var WORKER_URL = 'https://fcds-quote-calculator.jordan-danko.workers.dev';

  var form = document.getElementById('quote-form');
  var resultDiv = document.getElementById('quote-result');
  var errorDiv = document.getElementById('quote-error');
  var submitBtn = document.getElementById('quote-submit');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorDiv.style.display = 'none';
    resultDiv.style.display = 'none';

    var quantity = parseInt(document.getElementById('quantity').value, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 10) {
      showError('Quantity must be between 1 and 10.');
      return;
    }

    var doubleSided = document.querySelector('input[name="double_sided"]:checked').value === 'yes';

    var t1a = parseInt(document.getElementById('t1a').value, 10) || 0;
    var t1b = parseInt(document.getElementById('t1b').value, 10) || 0;
    var t2 = parseInt(document.getElementById('t2').value, 10) || 0;
    var t3 = parseInt(document.getElementById('t3').value, 10) || 0;
    var t4 = parseInt(document.getElementById('t4').value, 10) || 0;
    var thtComponents = parseInt(document.getElementById('tht_components').value, 10) || 0;
    var thtPins = parseInt(document.getElementById('tht_pins').value, 10) || 0;
    var bomCost = parseFloat(document.getElementById('bom_cost').value) || 0;
    var pcbCost = parseFloat(document.getElementById('pcb_cost').value) || 0;
    var timeline = parseInt(document.getElementById('timeline').value, 10);

    if (t1a < 0 || t1b < 0 || t2 < 0 || t3 < 0 || t4 < 0 || thtComponents < 0 || thtPins < 0) {
      showError('Component counts cannot be negative.');
      return;
    }

    if (bomCost < 0 || pcbCost < 0) {
      showError('Costs cannot be negative.');
      return;
    }

    var totalComponents = t1a + t1b + t2 + t3 + t4 + thtComponents;
    if (totalComponents === 0 && bomCost === 0 && pcbCost === 0) {
      showError('Please enter at least one component count or material cost.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Calculating...';

    var payload = {
      quantity: quantity,
      double_sided: doubleSided,
      t1a: t1a,
      t1b: t1b,
      t2: t2,
      t3: t3,
      t4: t4,
      tht_components: thtComponents,
      tht_pins: thtPins,
      bom_cost: bomCost,
      pcb_cost: pcbCost,
      timeline: timeline
    };

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Server error');
        return res.json();
      })
      .then(function (data) {
        var totalLow = data.total * 0.9;
        var totalHigh = data.total * 1.1;
        var perUnitLow = data.per_unit * 0.9;
        var perUnitHigh = data.per_unit * 1.1;
        document.getElementById('result-total').textContent = '$' + formatNumber(totalLow) + ' \u2013 $' + formatNumber(totalHigh);
        document.getElementById('result-per-unit').textContent = '$' + formatNumber(perUnitLow) + ' \u2013 $' + formatNumber(perUnitHigh);

        var warningsDiv = document.getElementById('quote-warnings');
        warningsDiv.innerHTML = '';
        if (data.warnings && data.warnings.length > 0) {
          data.warnings.forEach(function (w) {
            var p = document.createElement('p');
            p.className = 'quote-warning';
            p.textContent = w;
            warningsDiv.appendChild(p);
          });
        }

        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      })
      .catch(function () {
        showError('Unable to calculate quote. Please try again or contact us directly.');
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get Estimate';
      });
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }

  function formatNumber(n) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
})();
