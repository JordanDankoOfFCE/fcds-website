// FCDS Prototype Assembly Quote Calculator — Cloudflare Worker
// This file is deployed to Cloudflare Workers and NOT served to browsers.

const SHOP_RATE = 100; // $/hr
const NRE_HOURS = 2; // purchasing + job setup
const NRE_MARKUP = 2.50;
const STENCIL_UNIT_COST = 300;
const STENCIL_MARKUP = 2.00;
const CONSUMABLES_BASE = 25;
const CONSUMABLES_PER_BOARD = 0.50;
const CONSUMABLES_MARKUP = 1.25;
const COMPONENT_MARKUP = 1.20; // V1
const PCB_MARKUP = 1.75; // V1
const SMT_LABOR_MARKUP = 2.50; // V1
const THT_LABOR_MARKUP = 2.50; // V1
const THT_PER_PIN_RATE = 0.35;
const THT_MIN_PER_COMPONENT = 1.50;
const INSPECTION_MINUTES = 10;
const INSPECTION_MARKUP = 2.50; // V1
const SGA_DAILY_RATE = 452.27;
const SGA_DAYS = 1;

// Manual P&P time rates (min/placement)
const MANUAL_T1A_MIN = 1.0;
const MANUAL_T1B_MIN = 0.5;
const MANUAL_T2_MIN = 1.0;
const MANUAL_T3_MIN = 3.0;
const MANUAL_T4_MIN = 8.0;

// Rush surcharges
const RUSH = { 5: 0, 4: 0.15, 3: 0.35 };

function calculateQuote(input) {
  const qty = input.quantity;
  const warnings = [];

  // NRE
  const nreCost = NRE_HOURS * SHOP_RATE;
  const nreCharge = nreCost * NRE_MARKUP;

  // Stencil
  const numStencils = input.double_sided ? 2 : 1;
  const stencilCost = STENCIL_UNIT_COST * numStencils;
  const stencilCharge = stencilCost * STENCIL_MARKUP;

  // Consumables
  const consumablesCost = CONSUMABLES_BASE + (CONSUMABLES_PER_BOARD * qty);
  const consumablesCharge = consumablesCost * CONSUMABLES_MARKUP;

  // Components (turnkey, optional)
  const componentCostTotal = input.bom_cost * qty;
  const componentCharge = componentCostTotal * COMPONENT_MARKUP;

  // PCB (turnkey, optional)
  const pcbCostTotal = input.pcb_cost * qty;
  const pcbCharge = pcbCostTotal * PCB_MARKUP;

  // SMT Labor — Manual P&P
  const manualMinutesPerBoard =
    (input.t1a * MANUAL_T1A_MIN) +
    (input.t1b * MANUAL_T1B_MIN) +
    (input.t2 * MANUAL_T2_MIN) +
    (input.t3 * MANUAL_T3_MIN) +
    (input.t4 * MANUAL_T4_MIN);
  const manualHoursPerBoard = manualMinutesPerBoard / 60;
  const smtCostPerBoard = manualHoursPerBoard * SHOP_RATE;
  const smtCostTotal = smtCostPerBoard * qty;
  const smtCharge = smtCostTotal * SMT_LABOR_MARKUP;

  // THT Labor — simplified mode
  let thtCostPerBoard = 0;
  if (input.tht_pins > 0 || input.tht_components > 0) {
    const pinCost = input.tht_pins * THT_PER_PIN_RATE;
    const minCost = input.tht_components * THT_MIN_PER_COMPONENT;
    thtCostPerBoard = Math.max(pinCost, minCost);
  }
  const thtCostTotal = thtCostPerBoard * qty;
  const thtCharge = thtCostTotal * THT_LABOR_MARKUP;

  // Inspection & Handling
  const inspectionCostPerBoard = (INSPECTION_MINUTES / 60) * SHOP_RATE;
  const inspectionCostTotal = inspectionCostPerBoard * qty;
  const inspectionCharge = inspectionCostTotal * INSPECTION_MARKUP;

  // SG&A
  const sgaDays = input.double_sided ? SGA_DAYS + 0.5 : SGA_DAYS;
  const sgaCharge = SGA_DAILY_RATE * sgaDays;

  // Subtotal
  const subtotal = nreCharge + stencilCharge + consumablesCharge +
    componentCharge + pcbCharge + smtCharge + thtCharge +
    inspectionCharge + sgaCharge;

  // Rush
  const rushPct = RUSH[input.timeline] || 0;
  const rushCharge = subtotal * rushPct;

  const totalRaw = subtotal + rushCharge;
  const total = Math.round(totalRaw / 50) * 50;
  const perUnit = total / qty;

  // Warnings
  if (input.t4 > 0) {
    warnings.push('Your design includes BGA/LGA components. X-ray inspection is recommended and not included in this estimate.');
  }
  if (total < 2000) {
    warnings.push('Note: Our minimum project size is typically $2,000. This estimate may be adjusted upon formal review.');
  }

  return {
    total: Math.round(total * 100) / 100,
    per_unit: Math.round(perUnit * 100) / 100,
    warnings: warnings
  };
}

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const input = await request.json();

      // Validate inputs
      if (!input.quantity || input.quantity < 1 || input.quantity > 10) {
        return new Response(JSON.stringify({ error: 'Invalid quantity' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const timeline = input.timeline;
      if (![3, 4, 5].includes(timeline)) {
        return new Response(JSON.stringify({ error: 'Invalid timeline' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Sanitize numeric inputs
      const sanitized = {
        quantity: Math.floor(Math.max(1, Math.min(10, input.quantity))),
        double_sided: !!input.double_sided,
        t1a: Math.max(0, Math.floor(input.t1a || 0)),
        t1b: Math.max(0, Math.floor(input.t1b || 0)),
        t2: Math.max(0, Math.floor(input.t2 || 0)),
        t3: Math.max(0, Math.floor(input.t3 || 0)),
        t4: Math.max(0, Math.floor(input.t4 || 0)),
        tht_components: Math.max(0, Math.floor(input.tht_components || 0)),
        tht_pins: Math.max(0, Math.floor(input.tht_pins || 0)),
        bom_cost: Math.max(0, parseFloat(input.bom_cost) || 0),
        pcb_cost: Math.max(0, parseFloat(input.pcb_cost) || 0),
        timeline: timeline
      };

      const result = calculateQuote(sanitized);

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
