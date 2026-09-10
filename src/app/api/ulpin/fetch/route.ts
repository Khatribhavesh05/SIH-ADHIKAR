import { NextResponse } from "next/server";

export async function GET() {
  // Realistic seeded khasra/khata/owner ULPIN mock response
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  const mockData = {
    ulpinId: `14-27-089-${randomSuffix}`,
    khasraNumber: `${240 + Math.floor(Math.random() * 50)}/1`,
    khataNumber: `${80 + Math.floor(Math.random() * 20)}`,
    surveyNumber: `${110 + Math.floor(Math.random() * 30)}`,
    village: "Shivpur",
    tehsil: "Nashik",
    district: "Nashik",
    areaAcres: 12.5,
    landClassification: "AGRICULTURAL_MULTI_CROP_IRRIGATED",
    ownerName: "Devendra Vishwakarma",
    scStStatus: false,
  };

  return NextResponse.json(mockData);
}
