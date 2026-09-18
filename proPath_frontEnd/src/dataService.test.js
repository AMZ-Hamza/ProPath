import dataService from "./dataService";

function mockJsonResponse(payload, init = {}) {
  return Promise.resolve({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(JSON.stringify(payload)),
  });
}

describe("dataService API client", () => {
  beforeEach(async () => {
    global.fetch = jest.fn();
    await dataService.__unsafeReset();
  });

  afterEach(async () => {
    await dataService.__unsafeReset();
    jest.restoreAllMocks();
  });

  test("loads boot state from the backend", async () => {
    global.fetch.mockReturnValueOnce(
      mockJsonResponse({
        data: {
          settings: { appName: "ProPath" },
          isConfigured: true,
          user: null,
        },
      }),
    );

    const bootState = await dataService.fetchBootState();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/boot"),
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/json" }) }),
    );
    expect(bootState).toEqual({
      settings: { appName: "ProPath" },
      isConfigured: true,
      user: null,
    });
  });

  test("submits sanitized grades without calculating final grades on the client", async () => {
    global.fetch.mockReturnValueOnce(
      mockJsonResponse({
        data: [
          {
            studentId: 7,
            subjectId: 3,
            cc1: "12.00",
            cc2: null,
            cc3: "14.00",
            efm: "16.00",
            finalGrade: "15.00",
          },
        ],
      }),
    );

    await dataService.saveGrades({
      subjectId: 3,
      gradesByStudent: {
        7: { cc1: "12", cc2: "", cc3: "14", efm: "16" },
      },
    });

    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
      subjectId: 3,
      gradesByStudent: {
        7: { cc1: 12, cc2: null, cc3: 14, efm: 16 },
      },
    });
    expect(dataService.normalizeGradeRecord({ cc1: 12, efm: 16 }).final).toBeNull();
  });

  test("surfaces backend validation messages", async () => {
    global.fetch.mockReturnValueOnce(
      mockJsonResponse({ message: "The selected subject is invalid." }, { ok: false, status: 422 }),
    );

    await expect(
      dataService.saveGrades({
        subjectId: 99,
        gradesByStudent: { 1: { cc1: 10 } },
      }),
    ).rejects.toThrow("The selected subject is invalid.");
  });
});
