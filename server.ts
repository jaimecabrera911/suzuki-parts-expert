import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SAMPLE_VINS, SUZUKI_PARTS, SUZUKI_MODELS } from "./src/data/suzukiData.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Suzuki Parts Expert" });
  });

  // Search VIN / Placa Endpoint
  app.post("/api/search-vin", (req, res) => {
    const { vin } = req.body;
    if (!vin) {
      return res.status(400).json({ error: "VIN es requerido" });
    }

    const cleanVin = String(vin).trim().toUpperCase();
    const result = SAMPLE_VINS[cleanVin];

    if (result) {
      return res.json(result);
    }

    // Dynamic heuristic fallback for standard VIN inputs
    if (cleanVin.length >= 8) {
      if (cleanVin.includes("GSX")) {
        return res.json({
          vin: cleanVin,
          found: true,
          motorcycle: {
            brand: "SUZUKI",
            modelId: "gsx-r1000",
            modelName: "GSX-R1000",
            year: 2022,
            version: "GSX-R1000R Spec"
          },
          engineCode: "T720-301928",
          assemblyPlant: "Hamamatsu Plant, Japan",
          specsSummary: "Decodificado por patrón VIN: Serie GSX High Performance"
        });
      }
      if (cleanVin.includes("LC6") || cleanVin.includes("GIXXER") || cleanVin.includes("150")) {
        return res.json({
          vin: cleanVin,
          found: true,
          motorcycle: {
            brand: "SUZUKI",
            modelId: "gixxer-150-fi",
            modelName: "Gixxer 150 FI",
            year: 2020,
            version: "FI (Inyección Electrónica)"
          },
          engineCode: "F408-992102",
          assemblyPlant: "Suzuki Assembly Line",
          specsSummary: "Decodificado por patrón VIN: Serie Gixxer 150 FI"
        });
      }
    }

    return res.json({
      vin: cleanVin,
      found: false,
      message: "VIN no registrado en la base de datos de muestra. Selecciona manualmente la moto en el Selector Rápido."
    });
  });

  // Search OEM Reference Endpoint
  app.post("/api/search-oem", (req, res) => {
    const { oem } = req.body;
    if (!oem) {
      return res.status(400).json({ error: "Número OEM es requerido" });
    }

    const cleanOem = String(oem).trim().toUpperCase();
    const part = SUZUKI_PARTS.find(p => p.oemNumber.toUpperCase().includes(cleanOem) || cleanOem.includes(p.oemNumber.toUpperCase()));

    if (part) {
      return res.json({ found: true, part });
    }

    return res.json({ found: false, message: `No se encontró la referencia OEM '${cleanOem}' en la base de datos activa.` });
  });

  // Gemini AI Technical Assistant Endpoint
  app.post("/api/assistant", async (req, res) => {
    try {
      const { prompt, motorcycle } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          text: `**Asistente Técnico Suzuki (Modo Mantenimiento)**\n\nNo se detectó la clave de API de Gemini en el servidor, pero con gusto te ayudo con la información del catálogo:\n- **Para tu ${motorcycle?.modelName || 'motocicleta'} (${motorcycle?.year || 'Año'}):** Recomendamos usar siempre repuestos originales con código OEM.\n- **Filtro de Aceite:** Código OEM 16510-05240 (Reemplazo cada 3.000 - 5.000 km).\n- **Bujía Iridium:** Código OEM 09482-00406 (Calibración 0.8 - 0.9 mm).`
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const contextMotorcycle = motorcycle 
        ? `Motocicleta activa en el Garaje: ${motorcycle.brand} ${motorcycle.modelName} (Año ${motorcycle.year}, Versión: ${motorcycle.version}).`
        : 'El usuario aún no ha seleccionado una motocicleta específica en su Garaje.';

      const systemInstruction = `Eres "Suzuki Master Technical AI", un ingeniero especialista y jefe de taller oficial de repuestos Suzuki Genuine Parts.
Tu objetivo es responder de manera técnica, precisa y profesional en ESPAÑOL a las consultas de mecánicos y propietarios sobre piezas, compatibilidades, pares de apriete (torque), mantenimiento y códigos OEM de motocicletas Suzuki.

Contexto actual del vehículo: ${contextMotorcycle}

Catálogo disponible en el sistema:
${SUZUKI_PARTS.map(p => `- OEM: ${p.oemNumber} | ${p.name} | $${p.price} | Categ: ${p.category}`).join("\n")}

Directrices de respuesta:
1. Sé extremadamente técnico y conciso.
2. Si la consulta involucra la moto seleccionada (${motorcycle?.modelName || 'ninguna'}), verifica compatibilidades técnicas exactas.
3. Menciona códigos OEM Suzuki Genuine cuando sea relevante.
4. Usa formato Markdown limpio con negritas y listas.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3
        }
      });

      return res.json({ text: response.text || "No se pudo generar respuesta técnica." });
    } catch (error: any) {
      console.error("Gemini assistant error:", error);
      return res.status(500).json({ error: "Error en el asistente técnico Gemini: " + error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Suzuki Parts Expert server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
