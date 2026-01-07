import type { PrintShop as PrintShopDTO } from '@campus-os/types';

export class PrintShop implements PrintShopDTO {
  id: string;
  name: string;
  location: string;
  collegeId: string;
  isActive: boolean;
  lat?: number | undefined;
  lng?: number | undefined;
  pricePerPageBW: number;
  pricePerPageColor: number;
  resourceStatus: PrintShopDTO['resourceStatus'];

  constructor(dto: PrintShopDTO) {
    Object.assign(this, dto);
  }
}
