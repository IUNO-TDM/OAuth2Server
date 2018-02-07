**OAUTHDB Database - CHANGE-LOG**

- For new patches use the next consecutive **patch number** from the list

**IMPORTANT: USE ONLY [PatchDBTool](https://github.com/IUNO-TDM/PatchDBTool/tree/master/PatchDBTool) to deploy Patches**

|**Patchname**                                                      |**Patch number**   |**Description**                                                                                        |**Issue Number**   | **Author**                  |
|-------------------------------------------------------------------|-------------------|-------------------------------------------------------------------------------------------------------|-------------------|-----------------------------|
| 01_iuno_oauthdb_VinitialV_20171121.sql                    | Initial version   | Initial patch after deploying DB from Master Branch. Create Patches table.                                    |  [#38][i38]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0001V_20171121.sql                          | 0001              | Create GetRefreshToken function                                                                               |  [#37][i37]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0002V_20180110.sql                          | 0002              | Fix security issue in CreateLog function                                                                      |  [#44][i44]       | [@gomarcel][igomarcel]    |
| iuno_oauthdb_V0003V_20180111.sql                          | 0003              | Correct Column name on select return value in function CreateAuthorizationCode                                |  [#43][i43]       | [@gomarcel][igomarcel]      |
| iuno_oauthdb_V0004V_20180122.sql                          | 0004              | Added tables and functions for email verification                                                             |  [#26][i26]       | [@mbeuttler][imbeuttler]      |
| iuno_oauthdb_V0005V_20180125.sql                          | 0005              | Added tables and functions for password reset                                                                 |  [#53][i53]       | [@mbeuttler][imbeuttler]      |
| iuno_oauthdb_V0006V_20180207.sql                          | 0006              | Added new table to store login brute force attempts                                                           |  [#46][i46]       | [@mbeuttler][imbeuttler]      |

[i37]: https://github.com/IUNO-TDM/OAuth2Server/issues/37
[i38]: https://github.com/IUNO-TDM/OAuth2Server/issues/38
[i43]: https://github.com/IUNO-TDM/OAuth2Server/issues/43
[i44]: https://github.com/IUNO-TDM/OAuth2Server/issues/44
[i26]: https://github.com/IUNO-TDM/OAuth2Server/issues/26
[i53]: https://github.com/IUNO-TDM/OAuth2Server/issues/53
[i46]: https://github.com/IUNO-TDM/OAuth2Server/issues/46

[igomarcel]: https://github.com/gomarcel
[imbeuttler]: https://github.com/mbeuttler