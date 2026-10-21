import type { ScenarioDefinition } from './types';
export default [
  {id:'street-start',chapter:'toystreet',boundary:'street'},
  {id:'street-left',chapter:'toystreet',boundary:'street',arena:'workshop',activated:['workshop']},
  {id:'street-right',chapter:'toystreet',boundary:'street',arena:'carousel',activated:['carousel']},
  {id:'street-left-clear',chapter:'toystreet',boundary:'street',arena:'workshop',cleared:['workshop'],activated:['workshop']},
  {id:'street-right-clear',chapter:'toystreet',boundary:'street',arena:'carousel',cleared:['carousel'],activated:['carousel']},
  {id:'street-one-anchor',chapter:'toystreet',boundary:'street',cleared:['workshop'],disabled:['workshop'],activated:['workshop']},
  {id:'street-one-anchor-right',chapter:'toystreet',boundary:'street',cleared:['carousel'],disabled:['carousel'],activated:['carousel']},
  {id:'street-both-active',chapter:'toystreet',boundary:'street',activated:['workshop','carousel']},
  {id:'street-both-clear',chapter:'toystreet',boundary:'street',cleared:['workshop','carousel'],activated:['workshop','carousel']},
  {id:'street-right-last',chapter:'toystreet',boundary:'street',arena:'carousel',cleared:['workshop','carousel'],disabled:['workshop'],activated:['workshop','carousel']},
  {id:'street-left-last',chapter:'toystreet',boundary:'street',arena:'workshop',cleared:['workshop','carousel'],disabled:['carousel'],activated:['workshop','carousel']},
  {id:'street-complete',chapter:'toystreet',boundary:'street-complete',cleared:['workshop','carousel'],disabled:['workshop','carousel'],activated:['workshop','carousel']},
] satisfies ScenarioDefinition[];
