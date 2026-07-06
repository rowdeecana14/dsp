import hpDental2x2 from '../../hangingprotocols/hpDental2x2';

export default function getHangingProtocolModule() {
  return [
    {
      name: hpDental2x2.id,
      protocol: hpDental2x2,
    },
  ];
}
