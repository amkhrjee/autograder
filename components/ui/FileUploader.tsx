"use client";
import { checkAvailibility, getDownloadURL, getSignedURL } from "@/app/actions";
import { FilesContext } from "@/app/context/FilesContext";
import { SetFilesContext } from "@/app/context/SetFilesContext";
import { Status } from "@/config/definitions";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  ChartBar,
  Check,
  DownloadIcon,
  Loader2,
  UploadIcon,
} from "lucide-react";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

type Model = "google" | "aws";

export function FileUploader() {
  const [status, setStatus] = useState<Status>(Status.Uploading);
  const [downloadURL, setDownloadURL] = useState<string>("");
  const [shouldNotify, setShouldNotify] = useState<boolean>(false);
  const [currentModel, setCurrentModel] = useState<Model>("aws");
  const [data, setData] = useState<{ [key: string]: number }>({});

  const pieChartConfig = {
    visitors: {
      label: "no. of students ",
    },

    safari: {
      label: "Safari",
      color: "hsl(142.1 70.6% 45.3%)",
    },
    firefox: {
      label: "Firefox",
      color: "hsl(0 84.2% 60.2%)",
    },
  } satisfies ChartConfig;

  useEffect(() => {
    if (status === Status.Processed && shouldNotify) {
      new Notification("done processing marksheets!", {
        body: "you can download the csv file or close the tab.",
      });
    } else if (status === Status.Processing && currentModel === "aws") {
      const intervalId = setInterval(() => {
        checkAvailibility().then((isAvailable) => {
          if (isAvailable) {
            clearInterval(intervalId);
            setTimeout(() => {
              setStatus(Status.Processed);
              getDownloadURL().then((url) => {
                setDownloadURL(url);
              });
            }, 7000);
          }
        });
      }, 500);
    }
  }, [status, shouldNotify]);

  const files = useContext(FilesContext);
  const setFiles = useContext(SetFilesContext);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      console.log(e.target.files);
      setFiles!(e.target.files);
      setStatus(Status.Uploaded);
    }
  };

  function handleGoBack(): void {
    setStatus(Status.Uploading);
    setFiles!(null);
  }

  function compressFiles(files: FileList) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    return Promise.all(
      Array.from(files).map(async (file) => imageCompression(file, options))
    );
  }

  async function handleNextStep() {
    setStatus(Status.Processing);
    const compressedImages = await compressFiles(files!);
    const zip = new JSZip();
    compressedImages.forEach((file) => {
      zip.file(file.name, file);
    });
    const zippedBlob = await zip.generateAsync({ type: "blob" });

    const signedURL = await getSignedURL();
    const url = await signedURL.success.url;
    await fetch(url, {
      method: "PUT",
      body: zippedBlob,
      headers: {
        "Content-Type": zippedBlob.type,
      },
    });
  }

  function getNotificationPermission() {
    if (Notification.permission === "granted") {
      setShouldNotify(true);
    } else {
      Notification.requestPermission().then((result) => {
        if (result === "granted") {
          setShouldNotify(true);
        }
      });
    }
  }

  async function handleDownload() {
    try {
      const response = await fetch(downloadURL);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], {
        type: "application/octet-stream",
      });

      const text = await blob.text();
      const rows = text
        .trim()
        .split("\n")
        .map((row) => row.split(",").map((cell) => cell.trim()));
      const headers = rows[0];

      const enrollmentIndex = headers.indexOf("Enrollment No.");
      const totalIndex = headers.indexOf("Total");

      const dict: { [key: string]: number } = {};
      const rowCopy: string[][] = [];

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const enrollment = cols[enrollmentIndex] || `row-${i + 1}`;
        const total = parseFloat(cols[totalIndex]) || 0;
        dict[enrollment] = total;
        rowCopy.push([...cols]);
      }
      setData(dict);
      console.log(dict);

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${crypto.randomUUID()}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }

  async function handleGoogleDownload() {
    // setStatus()
  }

  async function handleGoogleUpload() {
    alert("workng on fixing this");
    // setStatus(Status.Processing);
    // if (!files || files.length === 0) {
    //   console.error("No files available to upload.");
    //   return;
    // }
    // const formData = new FormData();
    // for (const file of files) {
    //   console.log("hello", file.name);
    //   formData.append(file.name, file);
    // }
    // console.log("FormData entries:");
    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    // const response = await fetch("/api/document", {
    //   method: "POST",
    //   body: formData,
    // });
    // console.log(response);
    // const fileStream = await response.blob();
    // const file = new File([fileStream], "document.csv", {
    //   type: "text/csv",
    // });
    // const downloadUrl = window.URL.createObjectURL(file);
    // const link = document.createElement("a");
    // link.href = downloadUrl;
    // link.download = "document.csv";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // window.URL.revokeObjectURL(downloadUrl);
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        multiple
        id="file_uploader"
        className="hidden"
        onChange={handleFileChange}
      />
      {status === Status.Uploading && (
        <div className="flex flex-col justify-center items-center gap-4">
          <Button
            className="text-lg"
            onClick={() => document.getElementById("file_uploader")?.click()}
          >
            <UploadIcon /> upload scanned marksheets
          </Button>
          <div className="flex gap-4">
            <Button
              variant={"outline"}
              onClick={() => setCurrentModel("google")}
            >
              {currentModel === "google" && <Check />} google documentai
            </Button>
            <Button variant={"outline"} onClick={() => setCurrentModel("aws")}>
              {currentModel === "aws" && <Check />} aws textract
            </Button>
          </div>
        </div>
      )}
      {status === Status.Uploaded && (
        <>
          <Button
            className="text-lg"
            onClick={
              currentModel === "aws" ? handleNextStep : handleGoogleUpload
            }
          >
            Proceed to next step <ArrowRight />
          </Button>
          <br />
          <Button
            className="text-lg"
            variant="secondary"
            onClick={handleGoBack}
          >
            <ArrowLeft /> go back
          </Button>
        </>
      )}
      {status === Status.Processing && (
        <>
          <Button disabled className="text-lg">
            <Loader2 className="animate-spin" /> Processing
          </Button>
          <br />
          <p className="text-sm">
            this may take a while, so keep this tab open.
          </p>
          <br />
          <Button disabled={shouldNotify} onClick={getNotificationPermission}>
            <Bell />{" "}
            {shouldNotify
              ? "You'll be notified when done"
              : "Get notified when done"}
          </Button>
        </>
      )}
      {status === Status.Processed && (
        <>
          <Button
            onClick={
              currentModel === "google" ? handleGoogleDownload : handleDownload
            }
          >
            <DownloadIcon /> download speadsheeet
          </Button>
          <br />
          <Dialog>
            <DialogTrigger>
              <Button variant={"secondary"}>
                <ChartBar /> view analytics
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ChartBar /> analytics
                </DialogTitle>
                <DialogDescription className="p-4">
                  <div className="grid grid-cols-4 gap-2 ">
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {(
                            Object.values(data).reduce(
                              (sum, val) => sum + val,
                              0
                            ) / Object.values(data).length
                          ).toFixed(2)}
                        </p>
                        <p>mean</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {(() => {
                            const sortedValues = Object.values(data).sort(
                              (a, b) => a - b
                            );
                            const mid = Math.floor(sortedValues.length / 2);
                            return sortedValues.length % 2 === 0
                              ? (
                                  (sortedValues[mid - 1] + sortedValues[mid]) /
                                  2
                                ).toFixed(2)
                              : sortedValues[mid];
                          })()}
                        </p>
                        <p>median</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {Object.values(data)
                            .sort(
                              (a, b) =>
                                Object.values(data).filter((v) => v === a)
                                  .length -
                                Object.values(data).filter((v) => v === b)
                                  .length
                            )
                            .pop()}
                        </p>
                        <p>mode</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {Math.max(...Object.values(data))}
                        </p>
                        <p>maximum</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {Math.min(...Object.values(data))}
                        </p>
                        <p>minimum</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {(() => {
                            const values = Object.values(data);
                            const mean =
                              values.reduce((sum, val) => sum + val, 0) /
                              values.length;
                            const variance =
                              values.reduce(
                                (sum, val) => sum + Math.pow(val - mean, 2),
                                0
                              ) / values.length;
                            return Math.sqrt(variance).toFixed(2);
                          })()}
                        </p>
                        <p>std dev</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {Math.max(...Object.values(data)) -
                            Math.min(...Object.values(data))}
                        </p>
                        <p>range</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="text-center">
                        <p className="font-bold text-lg">
                          {(() => {
                            const values = Object.values(data);
                            const passCount = values.filter(
                              (val) => val >= 15
                            ).length;
                            const failCount = values.length - passCount;
                            return `${passCount}/${failCount}`;
                          })()}
                        </p>
                        <p>pass/fail</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="mt-4 flex justify-between gap-2">
                    <Card className="w-full">
                      <CardHeader className="font-bold">
                        top 3 students
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4">
                          {Object.entries(data)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([enrollment, marks], index) => (
                              <li key={index}>
                                {enrollment}: {marks}
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="w-full">
                      <CardHeader className="font-bold">
                        bottom 3 students
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-4">
                          {Object.entries(data)
                            .sort(([, a], [, b]) => a - b)
                            .slice(0, 3)
                            .map(([enrollment, marks], index) => (
                              <li key={index}>
                                {enrollment}: {marks}
                              </li>
                            ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={
                          {
                            desktop: {
                              label: "marks",
                              color: "black",
                            },
                          } satisfies ChartConfig
                        }
                      >
                        <LineChart
                          accessibilityLayer
                          data={Object.entries(data).map(
                            ([enrollment, marks]) => ({
                              enrollment,
                              marks,
                            })
                          )}
                          margin={{
                            left: 12,
                            right: 12,
                          }}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="enrollment"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(-3)} // Show the last 3 digits of enrollment number
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                          />
                          <Line
                            dataKey="marks"
                            type="linear"
                            stroke="var(--color-desktop)"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                  <Card className="flex flex-col mt-4">
                    <CardHeader className="items-center pb-0">
                      <CardTitle>pass/fail</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                      <ChartContainer
                        config={pieChartConfig}
                        className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
                      >
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                nameKey="visitors"
                                hideLabel
                              />
                            }
                          />
                          <Pie
                            data={[
                              {
                                browser: "pass",
                                visitors: Object.values(data).filter(
                                  (val) => val >= 15
                                ).length,
                                fill: "hsl(142.1 70.6% 45.3%)", // success color
                              },
                              {
                                browser: "fail",
                                visitors: Object.values(data).filter(
                                  (val) => val < 15
                                ).length,
                                fill: "red",
                              },
                            ]}
                            dataKey="visitors"
                          >
                            <LabelList
                              dataKey="browser"
                              className="fill-background"
                              stroke="none"
                              fontSize={12}
                              formatter={(value: keyof typeof pieChartConfig) =>
                                pieChartConfig[value]?.label
                              }
                            />
                          </Pie>
                        </PieChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
