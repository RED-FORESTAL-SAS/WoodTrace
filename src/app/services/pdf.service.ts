import { Injectable } from "@angular/core";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Filesystem, Directory, WriteFileResult } from "@capacitor/filesystem";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Timestamp } from "../types/timestamp.type";
import { WtReport } from "../models/wt-report";
import { WtUser } from "../models/wt-user";
import { WtCompany } from "../models/wt-company";
import { FileOpener } from "@capacitor-community/file-opener";
import { TU_LOGO_AQUI_PNG } from "../constants/tu-logo-aqui-png.constant";
import { LOGO_RED_FORESTAL_SVG } from "../constants/logo-red-forestal-svg.constant";
import { Capacitor } from "@capacitor/core";

(<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: "root",
})
export class PdfService {
  /**
   * Builds Report PDF, saves it in file system and returns a file path.
   * Optionally, opens the generated PDF.
   *
   * @param report
   * @param user
   * @param company
   * @param open
   * @returns
   */
  public async buildReportPdf(
    report: WtReport,
    user: WtUser,
    company: WtCompany,
    open = true
  ): Promise<string> {
    const pdfDefinitions = this.buildPdfDefinitions(report, user, company);
    const pdfObject = pdfMake.createPdf(pdfDefinitions);

    // If testing on web, just download the pdf and return dummy path.
    if (Capacitor.getPlatform() === "web") {
      pdfObject.download();
      return "path-al-pdf-generado-en-web.pdf";
    }

    const dataUrl = await this.getDataUrl(pdfObject);
    const filePath = await this.savePdfFile(
      `reporte-${report.localId}.pdf`,
      dataUrl
    );

    if (open) await this.open(filePath.uri);

    return filePath.uri;
  }

  /**
   * Retrieves DataURL from created PDF (Promisify pdfmake API).
   *
   * @param pdfData
   * @returns
   */
  private getDataUrl = (pdfObject: pdfMake.TCreatedPdf) =>
    new Promise<string>((resolve) => {
      pdfObject.getDataUrl((result: string) => {
        resolve(result);
      });
    });

  /**
   * Downloads pdf file into file system.
   *
   * @param filePath
   * @param dataUrl
   * @returns
   */
  private async savePdfFile(
    filePath: string,
    dataUrl: string,
    directory: Directory = Directory.External
  ): Promise<WriteFileResult> {
    /**
     * @dev No need to request for permissions since Filesytem will do it automatically.
     */
    return Filesystem.writeFile({
      path: filePath,
      data: dataUrl,
      directory: directory,
      // @dev No "encoding" value is provided to write file as base64.
    });
  }

  /**
   * Reads a file, givent its path. Returns string with content or null if file does not exist.
   *
   * @param filePath
   * @returns
   */
  async readPdfFile(filePath: string): Promise<string | null> {
    return Filesystem.readFile({
      path: filePath,
      // @dev do not provide a directory, since path is absolute.
    })
      .then((result) => {
        return result.data;
      })
      .catch((e) => {
        if (e instanceof Error) {
          if (e.message.includes("File does not exist")) {
            return null;
          }
        }

        throw e;
      });
  }

  /**
   * Opens a file given a file path.
   *
   * @param filePath
   */
  open = async (filePath: string) => {
    await FileOpener.open({
      filePath: filePath,
      openWithDefault: true,
      contentType: "application/pdf",
    });
  };

  /**
   * Builds a pdf document, given a report, a User and a Company .
   *
   * @param report
   * @param user
   * @param company
   * @param download If generated pdf must be downloaded inmediately.
   */
  private buildPdfDefinitions(
    report: WtReport,
    user: WtUser,
    company: WtCompany
  ): TDocumentDefinitions {
    const leftMargin = 60;
    const rightMargin = 60;
    const companyPhoto =
      company.photo && company.photo !== ""
        ? `${company.photo}`
        : TU_LOGO_AQUI_PNG;

    const docDefinition: TDocumentDefinitions = {
      pageMargins: [leftMargin, 130, rightMargin, 40],
      header: {
        margin: [leftMargin, 40, rightMargin, 0],
        layout: "noBorders",
        table: {
          widths: ["auto", "*"],
          body: [
            [
              {
                svg: LOGO_RED_FORESTAL_SVG,
                alignment: "left",
                fit: [231, 94],
              },
              {
                image: companyPhoto,
                alignment: "right",
                fit: [80, 80],
              },
            ],
          ],
        },
      },

      content: [
        { text: "Informe de Análisis", style: "h3" },
        {
          text: "El presente reporte corresponde al análisis desarrollado por un funcionario, servidor público, técnico de campo para un conjunto de muestras de madera que fueron analizadas con una lupa de 60X a través de un dispositivo móvil y que fueron analizadas por el aplicativo móvil WoodTracer el cual emplea inteligencia artificial para la clasificación de imágenes. A continuación se presenta la información de la entidad que realiza el análisis, la información del operario del dispositivo móvil encargado de tomar las fotografías en campo de la madera y los resultados del análisis para cada una de las piezas muestreadas en campo.",
          style: "p",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Datos de la Entidad", style: "h3" },
        {
          text: [
            { text: "Nombre Entidad: ", style: "dt" },
            {
              text: `${company.nombres} ${
                company.apellidos ? company.apellidos : ""
              }`.trim(),
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Funcionario: ", style: "dt" },
            {
              text: `${user.fullName}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Fecha del Informe: ", style: "dt" },
            {
              text: (report.fCreado as Timestamp).toDate().toLocaleString(),
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Datos del Actor", style: "h3" },
        {
          text: [
            { text: "Nombre o Placa: ", style: "dt" },
            {
              text:
                report.personaType === "vehiculo"
                  ? report.placa
                  : report.fullName,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "No. de guía o cédula: ", style: "dt" },
            {
              text:
                report.personaType === "vehiculo"
                  ? report.guia
                  : report.docNumber,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Coordenada - Latitud: ", style: "dt" },
            {
              text: `${report.ubicacion.lat}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: [
            { text: "Coordenada - Longitud: ", style: "dt" },
            {
              text: `${report.ubicacion.lng}`,
              style: "dd",
            },
          ],
          style: "dl",
        },
        {
          text: "",
          style: "marginBottom",
        },

        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 475, y2: 0, lineWidth: 1 },
          ],
        },

        { text: "Análisis", style: "h3", pageBreak: "before" },

        {
          text: "A continuación se listan los resultados del análisis para cada una de las piezas de madera analizadas en campo con sus respectivo resultados encontrados.",
          style: "p",
        },
        report.woods.map((wood) => {
          const woodImage = wood.url;
          const especieDeclarada = wood.especieDeclarada
            ? wood.especieDeclarada
            : "-";
          const especieResultante = wood.especieResultante
            ? wood.especieResultante
            : "-";
          const acierto = wood.acierto
            ? Math.round(wood.acierto * 100).toString()
            : "-";
          return {
            table: {
              dontBreakRows: true,
              headerRows: 0,
              widths: ["auto", "*"],
              body: [
                [
                  {
                    image: woodImage,
                    width: 150,
                  },
                  [
                    {
                      text: [
                        { text: "Especie Reportada: ", style: "dt" },
                        {
                          text: especieDeclarada,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                    {
                      text: [
                        { text: "Especie Encontrada: ", style: "dt" },
                        {
                          text: especieResultante,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                    {
                      text: [
                        { text: "% de Acierto: ", style: "dt" },
                        {
                          text: acierto,
                          style: "dd",
                        },
                      ],
                      style: "dl",
                    },
                  ],
                ],
              ],
            },
            style: "woodTable",
          };
        }),
      ],
      styles: {
        h3: {
          fontSize: 12,
          bold: true,
          margin: [0, 40, 0, 5],
          alignment: "center",
        },
        p: {
          fontSize: 12,
          bold: false,
          margin: [0, 10, 0, 5],
          alignment: "justify",
        },
        dl: {
          margin: [0, 10, 0, 5],
        },
        dt: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5],
          alignment: "left",
        },
        dd: {
          fontSize: 12,
          bold: false,
          margin: [0, 10, 0, 5],
          alignment: "left",
        },
        marginBottom: {
          margin: [0, 0, 0, 25],
        },
        woodTable: {
          margin: [0, 0, 0, 10],
        },
      },
    };

    return docDefinition;
  }

  /**
   * Downloads a pdf given a pdf file path.
   *
   * @param pdf
   * @returns
   */
  private download = (pdf: pdfMake.TCreatedPdf) =>
    new Promise<void>((resolve) => {
      pdf.download("archivo.pdf", () => {
        resolve();
      });
    });

  /**
   * Returns a Blob with created PDF.
   *
   * @param pdf
   * @returns
   */
  private getBlob = (pdf: pdfMake.TCreatedPdf) =>
    new Promise<Blob>((resolve) => {
      pdf.getBlob((result: Blob) => {
        resolve(result);
      });
    });

  private getBuffer = (pdf: pdfMake.TCreatedPdf) =>
    new Promise<Buffer>((resolve) => {
      pdf.getBuffer((result: Buffer) => {
        resolve(result);
      });
    });

  private getArrayBuffer = (pdf: pdfMake.TCreatedPdf) =>
    new Promise<ArrayBufferLike>((resolve) => {
      pdf.getBuffer((result: Buffer) => {
        let utf8 = new Uint8Array(result);
        let binaryArray = utf8.buffer;
        resolve(binaryArray);
      });
    });
}
