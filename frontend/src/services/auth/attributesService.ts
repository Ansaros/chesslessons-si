import axiosInstance from "@/utils/axiosInstance";
import type { AttributesResponse, AttributeValue } from "@/types/auth";

export const attributesService = {
  async getAttributeTypes(): Promise<AttributesResponse> {
    const response = await axiosInstance.get<AttributesResponse>(
      "/attributes/types"
    );
    return response.data;
  },

  async getChessLevels(): Promise<AttributeValue[]> {
    const response = await this.getAttributeTypes();

    // Находим атрибут с названием "Уровень"
    const levelAttribute = response.data.find(
      (attr) => attr.name === "Уровень"
    );

    return levelAttribute?.values || [];
  },
};
