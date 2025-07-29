import type { System } from '@/index'

export enum PortType {
  tcp,
  udp,
}

// TODO: check system ports

export class PortsManager {
  private _ports: Record<PortType, Record<number, boolean>> = {
    [PortType.tcp]: {},
    [PortType.udp]: {},
  }

  constructor(private readonly system: System) {}

  async isTcpPortFree(port: number): Promise<boolean> {
    return !this._ports[PortType.tcp][port]
  }

  async isUdpPortFree(port: number): Promise<boolean> {
    return !this._ports[PortType.udp][port]
  }

  async occupyTcpPort(port: number): Promise<void> {
    this._ports[PortType.tcp][port] = true
  }

  async occupyUdpPort(port: number): Promise<void> {
    this._ports[PortType.udp][port] = true
  }

  async freeTcpPort(port: number): Promise<void> {
    delete this._ports[PortType.tcp][port]
  }

  async freeUdpPort(port: number): Promise<void> {
    delete this._ports[PortType.udp][port]
  }
}
