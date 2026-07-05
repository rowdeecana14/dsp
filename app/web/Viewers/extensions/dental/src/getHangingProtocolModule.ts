import hpDental2x2 from './hpDental2x2';

function getHangingProtocolModule() {
  return [
    {
      name: hpDental2x2.id,
      protocol: hpDental2x2,
    },
  ];
}

export default getHangingProtocolModule;
